// ============================================================
// Secure password storage — mirrors INFO2222's documented scheme:
//
//   · Argon2id (OWASP-recommended; memory-hard, GPU/ASIC-resistant)
//   · PHC hash format: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
//     (the PHC string embeds its own random salt + parameters)
//   · An ADDITIONAL 32-byte random salt stored in a separate column
//     ("defense in depth" in the INFO2222 schema): it is prepended to
//     the password before hashing, so an attacker needs BOTH the
//     password_hash and password_salt columns to attempt a crack.
//
// Server-only: argon2 is a native module — never import from client code.
// ============================================================

import "server-only";
import argon2 from "argon2";
import { randomBytes, timingSafeEqual } from "crypto";

// Match the parameters documented in INFO2222's schema comment:
// m=65536 (64 MiB), t=3, p=4.
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/** 32-byte cryptographically secure random salt, base64 (INFO2222 format). */
export function generateSalt(): string {
  return randomBytes(32).toString("base64");
}

/**
 * Hash a password for storage. Returns both columns the schema expects:
 * the Argon2id PHC string and the separate defense-in-depth salt.
 */
export async function hashPassword(
  password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> {
  const passwordSalt = generateSalt();
  const passwordHash = await argon2.hash(passwordSalt + password, ARGON2_OPTIONS);
  return { passwordHash, passwordSalt };
}

/** Verify a password against the stored hash + separate salt. */
export async function verifyPassword(
  password: string,
  passwordHash: string,
  passwordSalt: string,
): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, passwordSalt + password);
  } catch {
    // Malformed hash → treat as non-match, never throw to the caller.
    return false;
  }
}

// A real hash of a random throwaway password, verified against when a
// login targets a non-existent account — so "no such user" takes the same
// time as "wrong password" (prevents user enumeration by timing).
let dummyHashPromise: Promise<{ passwordHash: string; passwordSalt: string }> | null =
  null;

export function getDummyCredentials() {
  dummyHashPromise ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHashPromise;
}

/**
 * Password policy. INFO2222's UI enforced a 6-character minimum; we follow
 * current OWASP guidance (8+, length-first, no composition rules).
 */
export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 128) {
    return "Password must be at most 128 characters.";
  }
  return null;
}

/** Constant-time string comparison for tokens. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
