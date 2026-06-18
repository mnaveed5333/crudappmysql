import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") return null;
  return decoded;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, is_active, created_at FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const { name, phone, address, role, is_active, password } = await request.json();
    const pool = getPool();

    const fields = [];
    const values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (phone !== undefined) { fields.push("phone = ?"); values.push(phone); }
    if (address !== undefined) { fields.push("address = ?"); values.push(address); }
    if (role) { fields.push("role = ?"); values.push(role); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }
    if (password) { fields.push("password = ?"); values.push(await hashPassword(password)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, is_active, created_at FROM users WHERE id = ?",
      [id]
    );

    return NextResponse.json({ message: "Updated.", user: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const pool = getPool();
    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ message: "User deleted." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}