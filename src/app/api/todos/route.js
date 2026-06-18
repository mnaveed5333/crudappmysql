import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Reads the same "token" cookie your login route sets, and verifies it
// the same way the rest of your app does.
async function getCurrentUser(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token); // expected to return { id, role, ... }
  } catch {
    return null;
  }
}

// Demo in-memory store. Resets on server restart — swap with a real DB table later.
const store = globalThis.__todoStore || (globalThis.__todoStore = new Map());

function getUserTasks(userId) {
  if (!store.has(userId)) store.set(userId, []);
  return store.get(userId);
}

export async function GET(req) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ tasks: getUserTasks(user.id) });
}

export async function POST(req) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, priority = "medium", isDaily = false } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Task text is required." }, { status: 400 });
  }

  const task = {
    id: crypto.randomUUID(),
    text: text.trim(),
    priority,
    isDaily,
    completed: false,
    lastCompletedAt: null,
    createdAt: new Date().toISOString(),
  };

  getUserTasks(user.id).unshift(task);
  return NextResponse.json({ task }, { status: 201 });
}