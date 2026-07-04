// PUT /api/auth/password — Update password. Requires the current
// password, re-hashes with a FRESH salt, and revokes every other session
// (standard hygiene after a credential change).
import { NextResponse } from "next/server";
import { AuthError, requireSession } from "../../../lib/security/auth";
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from "../../../lib/security/password";
import { getSecurityStore } from "../../../lib/security/store";

export async function PUT(request: Request) {
  try {
    const { user, session } = await requireSession();
    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    const problem = validatePassword(newPassword);
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }

    const store = getSecurityStore();
    const full = await store.getUserById(user.id);
    if (!full) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const ok = await verifyPassword(
      currentPassword,
      full.passwordHash,
      full.passwordSalt,
    );
    if (!ok) {
      await store.logAudit({
        userId: user.id,
        eventType: "PASSWORD_CHANGE_FAILED",
        eventCategory: "AUTH",
        eventDescription: "Wrong current password on change attempt",
        success: false,
      });
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    const { passwordHash, passwordSalt } = await hashPassword(newPassword);
    await store.updateUser(user.id, { passwordHash, passwordSalt });

    // Keep this session, sign out everywhere else.
    const revoked = await store.revokeAllUserSessions(
      user.id,
      session.sessionToken,
      "PASSWORD_CHANGED",
    );
    await store.logAudit({
      userId: user.id,
      eventType: "PASSWORD_CHANGED",
      eventCategory: "AUTH",
      eventDescription: "Password changed",
      eventData: { other_sessions_revoked: revoked },
    });

    return NextResponse.json({ ok: true, otherSessionsRevoked: revoked });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("password PUT failed:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
