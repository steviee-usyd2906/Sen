// /api/auth/me — the user resource, own-account only:
//   GET    Read current user
//   PATCH  Update username / email
//   DELETE Delete account (revokes every session first)
import { NextResponse } from "next/server";
import {
  AuthError,
  clearSessionCookie,
  requireSession,
} from "../../../lib/security/auth";
import { getSecurityStore } from "../../../lib/security/store";
import { toPublicUser } from "../../../lib/security/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,50}$/;

export async function GET() {
  try {
    const { user } = await requireSession();
    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireSession();
    const body = await request.json().catch(() => ({}));
    const patch: { username?: string; email?: string } = {};

    if (body.username !== undefined) {
      const username = String(body.username).trim();
      if (!USERNAME_RE.test(username)) {
        return NextResponse.json(
          { error: "Username must be 3–50 characters (letters, numbers, . _ -)." },
          { status: 400 },
        );
      }
      patch.username = username;
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!EMAIL_RE.test(email) || email.length > 255) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 },
        );
      }
      patch.email = email;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const store = getSecurityStore();
    try {
      const updated = await store.updateUser(user.id, patch);
      if (!updated) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      await store.logAudit({
        userId: user.id,
        eventType: "USER_UPDATED",
        eventCategory: "AUTH",
        eventDescription: "Profile updated",
        eventData: { fields: Object.keys(patch) },
      });
      return NextResponse.json({ user: toPublicUser(updated) });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "EMAIL_TAKEN" || msg === "USERNAME_TAKEN") {
        return NextResponse.json(
          { error: "An account with those details already exists." },
          { status: 409 },
        );
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("me PATCH failed:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { user } = await requireSession();
    const store = getSecurityStore();

    // Revoke everything, then delete (audit row survives: user_id SET NULL).
    await store.revokeAllUserSessions(user.id, null, "ACCOUNT_DELETED");
    await store.logAudit({
      userId: user.id,
      eventType: "USER_DELETED",
      eventCategory: "AUTH",
      eventDescription: "Account deleted by user",
    });
    await store.deleteUser(user.id);
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("me DELETE failed:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
