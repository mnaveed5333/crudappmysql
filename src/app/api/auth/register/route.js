import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, phone, address, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const pool = getPool();

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashed = await hashPassword(password);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, address, password, role) VALUES (?, ?, ?, ?, ?, 'user')",
      [name, email, phone || null, address || null, hashed]
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    const user = rows[0];
    const token = signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({ message: "Registered successfully.", user }, { status: 201 });
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