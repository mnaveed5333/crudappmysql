import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// 1. Make this function async and await cookies()
async function requireAdmin() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") return null;
  return decoded;
}

export async function GET() {
  try {
    // 2. Await the admin check here
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users"
    );

    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}