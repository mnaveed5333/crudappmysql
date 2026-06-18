import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

// Await cookies natively in the dynamic runtime handler
async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
      [auth.id]
    );

    if (rows.length === 0) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { name, phone, address, password } = await request.json();
    const pool = getPool();

    const fields = [];
    const values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (phone !== undefined) { fields.push("phone = ?"); values.push(phone); }
    if (address !== undefined) { fields.push("address = ?"); values.push(address); }
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }
      fields.push("password = ?");
      values.push(await hashPassword(password));
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    values.push(auth.id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
      [auth.id]
    );

    return NextResponse.json({ message: "Updated.", user: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const pool = getPool();
    await pool.query("DELETE FROM users WHERE id = ?", [auth.id]);

    const response = NextResponse.json({ message: "Account deleted." });
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}