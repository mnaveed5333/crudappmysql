import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, password, role, is_active FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const user = rows[0];

    if (!user.is_active) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = signToken({ id: user.id, role: user.role });
    delete user.password;

    const response = NextResponse.json({ message: "Logged in.", user }, { status: 200 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}