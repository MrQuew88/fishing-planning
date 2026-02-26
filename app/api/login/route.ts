import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const hash = process.env.PASSWORD_HASH;

  if (!hash) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const valid = await bcrypt.compare(password, hash);

  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("killykeen_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}
