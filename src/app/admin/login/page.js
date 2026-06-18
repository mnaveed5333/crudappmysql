"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      if (data.user.role !== "admin") {
        setError("This account does not have admin access.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      router.push("/admin");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Admin Login</h1>

        {error && <div className="mb-4 rounded-lg bg-danger-light px-4 py-2 text-sm text-danger">{error}</div>}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary" />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-white hover:bg-primary-hover disabled:opacity-60">
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
      </form>
    </main>
  );
}