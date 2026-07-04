// POST /api/auth/logout — revoke the current session (Delete) and clear
// the cookie. Mirrors INFO2222's revoke_session('USER_LOGOUT').
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearSessionCookie,
  SESSION_COOKIE,
} from "../../../lib/security/auth";
import { getSecurityStore } from "../../../lib/security/store";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const store = getSecurityStore();
    const session = await store.getSessionByToken(token);
    await store.revokeSession(token, "USER_LOGOUT");
    if (session) {
      await store.logAudit({
        userId: session.userId,
        eventType: "SESSION_REVOKED",
        eventCategory: "AUTH",
        eventDescription: "User logged out",
      });
    }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
