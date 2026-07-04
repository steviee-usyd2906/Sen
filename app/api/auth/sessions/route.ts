// /api/auth/sessions — the session resource, own sessions only:
//   GET    Read (list) active sessions — token values are never returned
//   DELETE revoke all OTHER sessions ("sign out everywhere else")
import { NextResponse } from "next/server";
import { AuthError, requireSession } from "../../../lib/security/auth";
import { getSecurityStore } from "../../../lib/security/store";

export async function GET() {
  try {
    const { user, session } = await requireSession();
    const store = getSecurityStore();
    const sessions = await store.listUserSessions(user.id);
    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        current: s.sessionToken === session.sessionToken,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastActivityAt: s.lastActivityAt,
        expiresAt: s.expiresAt,
      })),
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function DELETE() {
  try {
    const { user, session } = await requireSession();
    const store = getSecurityStore();
    const revoked = await store.revokeAllUserSessions(
      user.id,
      session.sessionToken,
      "USER_LOGOUT_ALL",
    );
    await store.logAudit({
      userId: user.id,
      eventType: "SESSIONS_REVOKED_ALL",
      eventCategory: "AUTH",
      eventDescription: "All other sessions revoked",
      eventData: { count: revoked },
    });
    return NextResponse.json({ ok: true, revoked });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
