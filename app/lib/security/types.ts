// ============================================================
// Security domain types — column-for-column with scripts/001 (which is
// adapted from INFO2222's security schema), so the Supabase store maps
// rows 1:1 and the in-memory store behaves identically.
// ============================================================

export interface SecurityUser {
  id: string;
  username: string;
  email: string;
  /** Argon2id PHC string (see lib/security/password.ts). */
  passwordHash: string;
  /** Separate 32-byte base64 salt — defense in depth (INFO2222 scheme). */
  passwordSalt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  // Failed-login tracking (account lockout)
  failedLoginAttempts: number;
  lastFailedLoginAt: string | null;
  accountLockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/** What we expose to the client — never the hash/salt columns. */
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export function toPublicUser(u: SecurityUser): PublicUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export interface Session {
  id: string;
  userId: string;
  /** 256-bit cryptographically secure random token (base64url). */
  sessionToken: string;
  refreshToken: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  refreshExpiresAt: string | null;
  isValid: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
  createdAt: string;
  lastActivityAt: string;
}

export type AuditCategory = "AUTH" | "ADMIN" | "SYSTEM";

export interface AuditEvent {
  userId: string | null;
  eventType: string;
  eventCategory: AuditCategory;
  eventDescription: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  eventData?: Record<string, unknown> | null;
  success?: boolean;
  errorMessage?: string | null;
}

// ---- Store seam ------------------------------------------------------
// One interface, two implementations:
//   · memory-store.ts — default; lets the whole auth flow run with NO
//     database (same pattern as the forecast source seam)
//   · supabase-store.ts — used automatically once NEXT_PUBLIC_SUPABASE_URL
//     and SUPABASE_SERVICE_ROLE_KEY are set; maps onto scripts/001–003.

export interface SecurityStore {
  // Users — CRUD
  createUser(input: {
    username: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<SecurityUser>;
  getUserByEmail(email: string): Promise<SecurityUser | null>;
  getUserById(id: string): Promise<SecurityUser | null>;
  updateUser(
    id: string,
    patch: Partial<
      Pick<
        SecurityUser,
        | "username"
        | "email"
        | "passwordHash"
        | "passwordSalt"
        | "isActive"
        | "isEmailVerified"
      >
    >,
  ): Promise<SecurityUser | null>;
  deleteUser(id: string): Promise<boolean>;

  // Failed-login / lockout (mirrors INFO2222's SQL functions)
  incrementFailedLogin(userId: string): Promise<void>;
  resetFailedLogin(userId: string): Promise<void>;
  isAccountLocked(userId: string): Promise<boolean>;

  // Sessions — CRUD
  createSession(input: {
    userId: string;
    sessionToken: string;
    refreshToken: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: string;
    refreshExpiresAt: string | null;
  }): Promise<Session>;
  getSessionByToken(sessionToken: string): Promise<Session | null>;
  /** Update last_activity_at (validate_session's side effect). */
  touchSession(sessionToken: string): Promise<void>;
  revokeSession(sessionToken: string, reason: string): Promise<boolean>;
  revokeAllUserSessions(
    userId: string,
    exceptSessionToken: string | null,
    reason: string,
  ): Promise<number>;
  listUserSessions(userId: string): Promise<Session[]>;

  // Audit log — create + read (immutable by design; no update/delete)
  logAudit(event: AuditEvent): Promise<void>;
  listAuditForUser(userId: string, limit?: number): Promise<AuditEvent[]>;
}
