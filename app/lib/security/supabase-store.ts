// ============================================================
// Supabase SecurityStore — activates automatically once the database
// env vars are set (see getSecurityStore in store.ts). Maps 1:1 onto
// scripts/001_create_security_tables.sql and calls the SQL functions
// from scripts/003 (increment_failed_login, is_account_locked,
// revoke_session, …) exactly as INFO2222 does.
//
// Uses the service-role client (INFO2222 lib/supabase/admin.ts pattern):
// the server owns users/sessions; RLS keeps the anon key locked out.
// ============================================================

import "server-only";
import { createAdminClient } from "../supabase/admin";
import type {
  AuditEvent,
  SecurityStore,
  SecurityUser,
  Session,
} from "./types";

type UserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  password_salt: string;
  is_active: boolean;
  is_email_verified: boolean;
  failed_login_attempts: number;
  last_failed_login_at: string | null;
  account_locked_until: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

type SessionRow = {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  refresh_expires_at: string | null;
  is_valid: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
  created_at: string;
  last_activity_at: string;
};

const USER_COLUMNS =
  "id, username, email, password_hash, password_salt, is_active, is_email_verified, failed_login_attempts, last_failed_login_at, account_locked_until, created_at, updated_at, last_login_at";

const SESSION_COLUMNS =
  "id, user_id, session_token, refresh_token, ip_address, user_agent, expires_at, refresh_expires_at, is_valid, revoked_at, revoked_reason, created_at, last_activity_at";

function mapUser(r: UserRow): SecurityUser {
  return {
    id: r.id,
    username: r.username,
    email: r.email,
    passwordHash: r.password_hash,
    passwordSalt: r.password_salt,
    isActive: r.is_active,
    isEmailVerified: r.is_email_verified,
    failedLoginAttempts: r.failed_login_attempts,
    lastFailedLoginAt: r.last_failed_login_at,
    accountLockedUntil: r.account_locked_until,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    lastLoginAt: r.last_login_at,
  };
}

function mapSession(r: SessionRow): Session {
  return {
    id: r.id,
    userId: r.user_id,
    sessionToken: r.session_token,
    refreshToken: r.refresh_token,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    expiresAt: r.expires_at,
    refreshExpiresAt: r.refresh_expires_at,
    isValid: r.is_valid,
    revokedAt: r.revoked_at,
    revokedReason: r.revoked_reason,
    createdAt: r.created_at,
    lastActivityAt: r.last_activity_at,
  };
}

/** Translate Postgres unique-violation errors into the store's error codes. */
function translateInsertError(error: {
  code?: string;
  message?: string;
}): Error {
  if (error.code === "23505") {
    const msg = error.message ?? "";
    if (msg.includes("username")) return new Error("USERNAME_TAKEN");
    return new Error("EMAIL_TAKEN");
  }
  return new Error(error.message ?? "DB_ERROR");
}

export const supabaseStore: SecurityStore = {
  // ---- Users ----------------------------------------------------------
  async createUser({ username, email, passwordHash, passwordSalt }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        password_salt: passwordSalt,
      })
      .select(USER_COLUMNS)
      .single<UserRow>();
    if (error) throw translateInsertError(error);
    return mapUser(data);
  },

  async getUserByEmail(email) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select(USER_COLUMNS)
      .eq("email", email.toLowerCase())
      .maybeSingle<UserRow>();
    if (error) throw new Error(error.message);
    return data ? mapUser(data) : null;
  },

  async getUserById(id) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select(USER_COLUMNS)
      .eq("id", id)
      .maybeSingle<UserRow>();
    if (error) throw new Error(error.message);
    return data ? mapUser(data) : null;
  },

  async updateUser(id, patch) {
    const supabase = createAdminClient();
    const row: Record<string, unknown> = {};
    if (patch.username !== undefined) row.username = patch.username;
    if (patch.email !== undefined) row.email = patch.email.toLowerCase();
    if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
    if (patch.passwordSalt !== undefined) row.password_salt = patch.passwordSalt;
    if (patch.isActive !== undefined) row.is_active = patch.isActive;
    if (patch.isEmailVerified !== undefined)
      row.is_email_verified = patch.isEmailVerified;

    const { data, error } = await supabase
      .from("users")
      .update(row)
      .eq("id", id)
      .select(USER_COLUMNS)
      .maybeSingle<UserRow>();
    if (error) throw translateInsertError(error);
    return data ? mapUser(data) : null;
  },

  async deleteUser(id) {
    // Sessions cascade via FK (ON DELETE CASCADE in scripts/001).
    const supabase = createAdminClient();
    const { error, count } = await supabase
      .from("users")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  },

  // ---- Lockout — delegates to the SQL functions from scripts/003 -------
  async incrementFailedLogin(userId) {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("increment_failed_login", {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  async resetFailedLogin(userId) {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("reset_failed_login", {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  async isAccountLocked(userId) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("is_account_locked", {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
    return data === true;
  },

  // ---- Sessions ---------------------------------------------------------
  async createSession(input) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: input.userId,
        session_token: input.sessionToken,
        refresh_token: input.refreshToken,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
        expires_at: input.expiresAt,
        refresh_expires_at: input.refreshExpiresAt,
      })
      .select(SESSION_COLUMNS)
      .single<SessionRow>();
    if (error) throw new Error(error.message);
    return mapSession(data);
  },

  async getSessionByToken(sessionToken) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .select(SESSION_COLUMNS)
      .eq("session_token", sessionToken)
      .maybeSingle<SessionRow>();
    if (error) throw new Error(error.message);
    return data ? mapSession(data) : null;
  },

  async touchSession(sessionToken) {
    const supabase = createAdminClient();
    await supabase
      .from("sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("session_token", sessionToken)
      .eq("is_valid", true);
  },

  async revokeSession(sessionToken, reason) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("revoke_session", {
      p_session_token: sessionToken,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
    return data === true;
  },

  async revokeAllUserSessions(userId, exceptSessionToken, reason) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("revoke_all_user_sessions", {
      p_user_id: userId,
      p_except_session_token: exceptSessionToken,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
    return typeof data === "number" ? data : 0;
  },

  async listUserSessions(userId) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .select(SESSION_COLUMNS)
      .eq("user_id", userId)
      .eq("is_valid", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as SessionRow[]).map(mapSession);
  },

  // ---- Audit ------------------------------------------------------------
  async logAudit(event) {
    const supabase = createAdminClient();
    await supabase.rpc("create_audit_log", {
      p_user_id: event.userId,
      p_event_type: event.eventType,
      p_event_category: event.eventCategory,
      p_event_description: event.eventDescription,
      p_ip_address: event.ipAddress ?? null,
      p_user_agent: event.userAgent ?? null,
      p_event_data: event.eventData ?? null,
      p_success: event.success ?? true,
      p_error_message: event.errorMessage ?? null,
    });
  },

  async listAuditForUser(userId, limit = 50) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        "user_id, event_type, event_category, event_description, ip_address, user_agent, event_data, success, error_message",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      userId: r.user_id,
      eventType: r.event_type,
      eventCategory: r.event_category,
      eventDescription: r.event_description,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      eventData: r.event_data,
      success: r.success,
      errorMessage: r.error_message,
    })) as AuditEvent[];
  },
};
