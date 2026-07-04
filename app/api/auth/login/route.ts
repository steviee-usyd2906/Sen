// POST /api/auth/login — verify credentials (lockout-aware, uniform
// timing) and Create a session; token set as an httpOnly cookie.
import { NextResponse } from "next/server";
import {
  AuthError,
  loginUser,
  setSessionCookie,
} from "../../../lib/security/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { user, session } = await loginUser({
      email: body.email,
      password: body.password,
    });
    await setSessionCookie(session);
    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("login failed:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
