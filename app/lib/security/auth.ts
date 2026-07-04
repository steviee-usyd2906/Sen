// ============================================================
// Auth service — the security flows on top of the store seam, following
// INFO2222's design:
//
//   · Argon2id + separate salt for password storage (password.ts)
//   · 256-bit session tokens, 24h expiry / 7-day refresh window
//   · httpOnly + SameSite=Lax + Secure session cookie
//   · account lockout after 5 failed attempts (15 minutes)
//   · timing-equalised login (dummy verify when the user doesn't exist)
//   · audit log entries for every security event
//
// Route handlers call these; they never touch the store directly.
// ============================================================

import "server-only";
import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import {
  getDummyCredentials,
  hashPassword,
  validatePassword,
  verifyPassword,
} from "./password";
import { getSecurityStore } from "./store";
import { toPublicUser, type PublicUser, type Session } from "./types";

export const SESSION_COOKIE = "sen_session";
const SESSION_HOURS = 24; // matches create_session default (24 hours)
const REFRESH_DAYS = 7; // matches refresh_expires default (7 days)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,50}$/;

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** 256-bit cryptographically secure random token (INFO2222 spec). */
function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

async function requestContext() {
  const h = await headers();
  return {
    ipAddress:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null,
    userAgent: h.get("user-agent"),
  };
}

// ---- Register (Create user) -------------------------------------------

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const store = getSecurityStore();
  const username = input.username?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";

  if (!USERNAME_RE.test(username)) {
    throw new AuthError(
      "Username must be 3–50 characters (letters, numbers, . _ -).",
      400,
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 255) {
    throw new AuthError("Please enter a valid email address.", 400);
  }
  const passwordProblem = validatePassword(input.password);
  if (passwordProblem) throw new AuthError(passwordProblem, 400);

  const { passwordHash, passwordSalt } = await hashPassword(input.password);
  const ctx = await requestContext();

  try {
    const user = await store.createUser({
      username,
      email,
      passwordHash,
      passwordSalt,
    });
    await store.logAudit({
      userId: user.id,
      eventType: "USER_REGISTERED",
      eventCategory: "AUTH",
      eventDescription: "New account created",
      ...ctx,
    });
    return toPublicUser(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "EMAIL_TAKEN" || msg === "USERNAME_TAKEN") {
      // Same message for both: don't confirm which identifier exists.
      throw new AuthError(
        "An account with those details already exists.",
        409,
      );
    }
    throw e;
  }
}

// ---- Login (Create session) --------------------------------------------

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser; session: Session }> {
  const store = getSecurityStore();
  const email = input.email?.trim().toLowerCase() ?? "";
  const ctx = await requestContext();

  const user = await store.getUserByEmail(email);

  if (!user) {
    // Burn the same Argon2id work as a real verify → uniform timing.
    const dummy = await getDummyCredentials();
    await verifyPassword(input.password ?? "", dummy.passwordHash, dummy.passwordSalt);
    throw new AuthError("Incorrect email or password.", 401);
  }

  if (await store.isAccountLocked(user.id)) {
    await store.logAudit({
      userId: user.id,
      eventType: "LOGIN_BLOCKED_LOCKED",
      eventCategory: "AUTH",
      eventDescription: "Login attempt on locked account",
      success: false,
      ...ctx,
    });
    throw new AuthError(
      "Too many failed attempts. Try again in about 15 minutes.",
      423,
    );
  }

  const ok =
    user.isActive &&
    (await verifyPassword(input.password ?? "", user.passwordHash, user.passwordSalt));

  if (!ok) {
    await store.incrementFailedLogin(user.id);
    await store.logAudit({
      userId: user.id,
      eventType: "LOGIN_FAILED",
      eventCategory: "AUTH",
      eventDescription: "Failed login attempt",
      success: false,
      ...ctx,
    });
    throw new AuthError("Incorrect email or password.", 401);
  }

  await store.resetFailedLogin(user.id);

  const session = await store.createSession({
    userId: user.id,
    sessionToken: generateToken(),
    refreshToken: generateToken(),
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString(),
    refreshExpiresAt: new Date(
      Date.now() + REFRESH_DAYS * 86400_000,
    ).toISOString(),
  });

  await store.logAudit({
    userId: user.id,
    eventType: "LOGIN_SUCCESS",
    eventCategory: "AUTH",
    eventDescription: "Successful login",
    eventData: { session_id: session.id },
    ...ctx,
  });

  return { user: toPublicUser(user), session };
}

// ---- Session cookie helpers ---------------------------------------------

export async function setSessionCookie(session: Session) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

// ---- Current user (Read) --------------------------------------------------

export async function getCurrentSession(): Promise<{
  user: PublicUser;
  session: Session;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const store = getSecurityStore();
  const session = await store.getSessionByToken(token);
  if (
    !session ||
    !session.isValid ||
    new Date(session.expiresAt).getTime() <= Date.now()
  ) {
    return null;
  }

  const user = await store.getUserById(session.userId);
  if (!user || !user.isActive) return null;

  await store.touchSession(token); // validate_session's side effect
  return { user: toPublicUser(user), session };
}

/** Guard for authed API routes: returns the session or throws 401. */
export async function requireSession() {
  const current = await getCurrentSession();
  if (!current) throw new AuthError("Authentication required.", 401);
  return current;
}
