import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

async function getCurrentUser(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

const store = globalThis.__todoStore || (globalThis.__todoStore = new Map());

export async function PATCH(req, { params }) {
  const { id } = await params;
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = store.get(user.id) || [];
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const updates = await req.json();
  tasks[idx] = { ...tasks[idx], ...updates };
  return NextResponse.json({ task: tasks[idx] });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = store.get(user.id) || [];
  store.set(user.id, tasks.filter((t) => t.id !== id));
  return NextResponse.json({ ok: true });
}