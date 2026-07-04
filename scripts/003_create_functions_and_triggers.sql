-- =====================================================
-- Sen Security Functions and Triggers
-- Adapted from INFO2222/scripts/003_create_functions_and_triggers.sql
-- (chat/project triggers omitted). The Supabase store
-- (app/lib/security/supabase-store.ts) calls these via RPC.
-- =====================================================

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_updated_at();

-- =====================================================
-- SESSION CLEANUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE public.sessions
    SET is_valid = false,
        revoked_at = NOW(),
        revoked_reason = 'EXPIRED'
    WHERE expires_at < NOW()
    AND is_valid = true;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    INSERT INTO public.audit_logs (
        event_type, event_category, event_description, event_data
    ) VALUES (
        'SESSION_CLEANUP', 'SYSTEM', 'Expired sessions cleaned up',
        jsonb_build_object('count', deleted_count)
    );

    RETURN deleted_count;
END;
$$;

-- =====================================================
-- FAILED LOGIN TRACKING (5 attempts → 15-minute lockout)
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_failed_login(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_max_attempts INTEGER := 5;
    v_lockout_duration INTERVAL := INTERVAL '15 minutes';
BEGIN
    UPDATE public.users
    SET failed_login_attempts = failed_login_attempts + 1,
        last_failed_login_at = NOW(),
        account_locked_until = CASE
            WHEN failed_login_attempts + 1 >= v_max_attempts
            THEN NOW() + v_lockout_duration
            ELSE account_locked_until
        END
    WHERE id = p_user_id;

    INSERT INTO public.audit_logs (
        user_id, event_type, event_category, event_description, success
    ) VALUES (
        p_user_id, 'LOGIN_FAILED', 'AUTH', 'Failed login attempt', false
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_failed_login(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET failed_login_attempts = 0,
        last_failed_login_at = NULL,
        account_locked_until = NULL,
        last_login_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.audit_logs (
        user_id, event_type, event_category, event_description, success
    ) VALUES (
        p_user_id, 'LOGIN_SUCCESS', 'AUTH', 'Successful login', true
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_account_locked(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_locked_until TIMESTAMPTZ;
BEGIN
    SELECT account_locked_until INTO v_locked_until
    FROM public.users
    WHERE id = p_user_id;

    IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
        RETURN true;
    END IF;

    IF v_locked_until IS NOT NULL AND v_locked_until <= NOW() THEN
        UPDATE public.users
        SET account_locked_until = NULL,
            failed_login_attempts = 0
        WHERE id = p_user_id;
    END IF;

    RETURN false;
END;
$$;

-- =====================================================
-- SESSION MANAGEMENT
-- =====================================================
CREATE OR REPLACE FUNCTION public.revoke_session(
    p_session_token TEXT,
    p_reason TEXT DEFAULT 'USER_LOGOUT'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
BEGIN
    UPDATE public.sessions
    SET is_valid = false,
        revoked_at = NOW(),
        revoked_reason = p_reason
    WHERE session_token = p_session_token
    AND is_valid = true
    RETURNING user_id, id INTO v_user_id, v_session_id;

    IF v_session_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (
            user_id, event_type, event_category, event_description, event_data
        ) VALUES (
            v_user_id, 'SESSION_REVOKED', 'AUTH', 'Session revoked',
            jsonb_build_object('session_id', v_session_id, 'reason', p_reason)
        );
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_all_user_sessions(
    p_user_id UUID,
    p_except_session_token TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT 'USER_LOGOUT_ALL'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.sessions
    SET is_valid = false,
        revoked_at = NOW(),
        revoked_reason = p_reason
    WHERE user_id = p_user_id
    AND is_valid = true
    AND (p_except_session_token IS NULL OR session_token != p_except_session_token);

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count > 0 THEN
        INSERT INTO public.audit_logs (
            user_id, event_type, event_category, event_description, event_data
        ) VALUES (
            p_user_id, 'SESSIONS_REVOKED_ALL', 'AUTH', 'All sessions revoked',
            jsonb_build_object('count', v_count, 'reason', p_reason)
        );
    END IF;

    RETURN v_count;
END;
$$;

-- =====================================================
-- AUDIT LOG HELPER
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_category TEXT,
    p_event_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_event_data JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, event_type, event_category, event_description,
        ip_address, user_agent, event_data, success, error_message
    ) VALUES (
        p_user_id, p_event_type, p_event_category, p_event_description,
        p_ip_address, p_user_agent, p_event_data, p_success, p_error_message
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;
