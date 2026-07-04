-- =====================================================
-- Sen Row Level Security (RLS) Policies
-- Adapted from INFO2222/scripts/002_create_rls_policies.sql.
-- Defense at the database level: even if application code has bugs,
-- RLS prevents unauthorized access via the anon key.
--
-- NOTE: Sen's server talks to these tables with the SERVICE ROLE key
-- (app/lib/supabase/admin.ts), which bypasses RLS by design. These
-- policies exist so the anon/publishable key can NEVER read password
-- hashes, sessions, or audit rows — enabling RLS with no anon policies
-- is a deny-all for the public key.
-- =====================================================

-- =====================================================
-- USERS TABLE RLS — deny-all for anon
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- (Unlike INFO2222, no "users_select_public" policy: INFO2222 needed
-- user discovery for messaging; Sen does not, and password_hash /
-- password_salt must never be exposed through the public API.)

-- =====================================================
-- SESSIONS TABLE RLS — deny-all for anon
-- =====================================================
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
-- Session tokens are bearer credentials; only the service role touches them.

-- =====================================================
-- AUDIT LOGS TABLE RLS — deny-all for anon, and immutable
-- =====================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Belt-and-braces immutability: nobody updates or deletes audit rows,
-- not even by accident from server code.
REVOKE UPDATE, DELETE ON public.audit_logs FROM PUBLIC;
