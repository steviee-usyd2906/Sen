// ============================================================
// In-memory SecurityStore — the no-database default, mirroring the
// behaviour of INFO2222's SQL functions (increment_failed_login,
// is_account_locked, create/validate/revoke session, audit log) so the
// auth flow is fully exercisable before the database is connected.
// Data lives for the lifetime of the server process only.
// ============================================================

import "server-only";
import { randomUUID } from "crypto";
import type {
  AuditEvent,
  SecurityStore,
  SecurityUser,
  Session,
} from "./types";

// Same policy as INFO2222's increment_failed_login SQL function.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Anchored on globalThis so every route bundle shares ONE store: in dev,
// Next can instantiate this module once per route graph, and module-level
// Maps would silently split into per-route copies (register would succeed,
// login would then not find the user). Same pattern as dev-mode Prisma.
type MemoryDb = {
  users: Map<string, SecurityUser>;
  sessions: Map<string, Session>; // keyed by sessionToken
  auditLog: AuditEvent[];
};

const g = globalThis as typeof globalThis & { __senSecurityDb?: MemoryDb };
g.__senSecurityDb ??= {
  users: new Map(),
  sessions: new Map(),
  auditLog: [],
};
const { users, sessions, auditLog } = g.__senSecurityDb;

function now(): string {
  return new Date().toISOString();
}

export const memoryStore: SecurityStore = {
  // ---- Users ----------------------------------------------------------
  async createUser({ username, email, passwordHash, passwordSalt }) {
    const emailKey = email.toLowerCase();
    for (const u of users.values()) {
      if (u.email === emailKey) throw new Error("EMAIL_TAKEN");
      if (u.username.toLowerCase() === username.toLowerCase()) {
        throw new Error("USERNAME_TAKEN");
      }
    }
    const user: SecurityUser = {
      id: randomUUID(),
      username,
      email: emailKey,
      passwordHash,
      passwordSalt,
      isActive: true,
      isEmailVerified: false,
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      accountLockedUntil: null,
      createdAt: now(),
      updatedAt: now(),
      lastLoginAt: null,
    };
    users.set(user.id, user);
    return { ...user };
  },

  async getUserByEmail(email) {
    const key = email.toLowerCase();
    for (const u of users.values()) {
      if (u.email === key) return { ...u };
    }
    return null;
  },

  async getUserById(id) {
    const u = users.get(id);
    return u ? { ...u } : null;
  },

  async updateUser(id, patch) {
    const u = users.get(id);
    if (!u) return null;
    if (patch.email) {
      const key = patch.email.toLowerCase();
      for (const other of users.values()) {
        if (other.id !== id && other.email === key) throw new Error("EMAIL_TAKEN");
      }
      patch = { ...patch, email: key };
    }
    if (patch.username) {
      for (const other of users.values()) {
        if (
          other.id !== id &&
          other.username.toLowerCase() === patch.username.toLowerCase()
        ) {
          throw new Error("USERNAME_TAKEN");
        }
      }
    }
    Object.assign(u, patch, { updatedAt: now() });
    return { ...u };
  },

  async deleteUser(id) {
    for (const [token, s] of sessions) {
      if (s.userId === id) sessions.delete(token);
    }
    return users.delete(id);
  },

  // ---- Lockout (mirrors INFO2222 SQL) ----------------------------------
  async incrementFailedLogin(userId) {
    const u = users.get(userId);
    if (!u) return;
    u.failedLoginAttempts += 1;
    u.lastFailedLoginAt = now();
    if (u.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      u.accountLockedUntil = new Date(
        Date.now() + LOCKOUT_MINUTES * 60_000,
      ).toISOString();
    }
  },

  async resetFailedLogin(userId) {
    const u = users.get(userId);
    if (!u) return;
    u.failedLoginAttempts = 0;
    u.lastFailedLoginAt = null;
    u.accountLockedUntil = null;
    u.lastLoginAt = now();
  },

  async isAccountLocked(userId) {
    const u = users.get(userId);
    if (!u?.accountLockedUntil) return false;
    if (new Date(u.accountLockedUntil).getTime() > Date.now()) return true;
    // Lock expired → reset, exactly like is_account_locked() in SQL.
    u.accountLockedUntil = null;
    u.failedLoginAttempts = 0;
    return false;
  },

  // ---- Sessions ---------------------------------------------------------
  async createSession(input) {
    const session: Session = {
      id: randomUUID(),
      userId: input.userId,
      sessionToken: input.sessionToken,
      refreshToken: input.refreshToken,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      expiresAt: input.expiresAt,
      refreshExpiresAt: input.refreshExpiresAt,
      isValid: true,
      revokedAt: null,
      revokedReason: null,
      createdAt: now(),
      lastActivityAt: now(),
    };
    sessions.set(session.sessionToken, session);
    return { ...session };
  },

  async getSessionByToken(sessionToken) {
    const s = sessions.get(sessionToken);
    return s ? { ...s } : null;
  },

  async touchSession(sessionToken) {
    const s = sessions.get(sessionToken);
    if (s?.isValid) s.lastActivityAt = now();
  },

  async revokeSession(sessionToken, reason) {
    const s = sessions.get(sessionToken);
    if (!s || !s.isValid) return false;
    s.isValid = false;
    s.revokedAt = now();
    s.revokedReason = reason;
    return true;
  },

  async revokeAllUserSessions(userId, exceptSessionToken, reason) {
    let count = 0;
    for (const s of sessions.values()) {
      if (
        s.userId === userId &&
        s.isValid &&
        s.sessionToken !== exceptSessionToken
      ) {
        s.isValid = false;
        s.revokedAt = now();
        s.revokedReason = reason;
        count += 1;
      }
    }
    return count;
  },

  async listUserSessions(userId) {
    return [...sessions.values()]
      .filter((s) => s.userId === userId && s.isValid)
      .map((s) => ({ ...s }));
  },

  // ---- Audit ------------------------------------------------------------
  async logAudit(event) {
    auditLog.push({ success: true, ...event });
  },

  async listAuditForUser(userId, limit = 50) {
    return auditLog
      .filter((e) => e.userId === userId)
      .slice(-limit)
      .reverse();
  },
};
