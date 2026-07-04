// POST /api/auth/register — Create user (Argon2id + salt storage).
import { NextResponse } from "next/server";
import { AuthError, registerUser } from "../../../lib/security/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = await registerUser({
      username: body.username,
      email: body.email,
      password: body.password,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("register failed:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
