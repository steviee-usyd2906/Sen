-- =====================================================
-- Sen Security Database Schema
-- Adapted from INFO2222/scripts/001_create_security_tables.sql:
--   1. Secure Password Storage (Argon2id hashing with salting)
--   2. Session management (secure random tokens, rotation, expiry)
--   3. Failed-login tracking / account lockout
--   4. Security audit log
-- Omitted from INFO2222 on purpose: certificates, key_pairs, pre_keys,
-- conversations/messages (E2EE chat) — Sen has no messaging feature.
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS TABLE - Secure Password Storage
-- =====================================================
-- Password hashing: Argon2id (application level, app/lib/security/password.ts)
-- - Argon2id is the algorithm recommended by OWASP
-- - Memory-hard and resistant to GPU/ASIC attacks
-- - Hash format: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
-- - password_salt is an ADDITIONAL 32-byte random value (base64), stored
--   separately for defense in depth and prepended before hashing
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    email_verification_expires_at TIMESTAMPTZ,
    -- Password reset
    password_reset_token TEXT,
    password_reset_expires_at TIMESTAMPTZ,
    -- Failed login tracking (rate limiting / account lockout)
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login_at TIMESTAMPTZ,
    account_locked_until TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- =====================================================
-- 2. SESSIONS TABLE - Server Authentication
-- =====================================================
-- - session_token: 256-bit cryptographically secure random value
-- - refresh_token for rotation
-- - IP + user agent captured for anomaly review
-- - automatic expiry; revocation with reason
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ,
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.sessions(expires_at);

-- =====================================================
-- 3. AUDIT LOG TABLE - Security Auditing
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('AUTH', 'ADMIN', 'SYSTEM')),
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    event_data JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
