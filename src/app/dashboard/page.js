"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TodoList from "../../../components/TodoList";

const NAV_ITEMS = [
  { key: "profile", label: "Profile", icon: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" },
  { key: "tasks", label: "My tasks", icon: "M9 11l3 3L22 4M2 12.5a9.5 9.5 0 1 0 19 0 9.5 9.5 0 0 0-19 0z" },
];

function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: "", phone: "", address: "", password: "" });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setForm({ name: data.user.name, phone: data.user.phone || "", address: data.user.address || "", password: "" });
      })
      .catch(() => router.push("/login"));
  }, [router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const payload = { name: form.name, phone: form.phone, address: form.address };
    if (form.password) payload.password = form.password;

    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Update failed.");
      return;
    }
    setUser(data.user);
    setEditing(false);
    setMessage("Profile updated.");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    const res = await fetch("/api/users/me", { method: "DELETE" });
    if (res.ok) router.push("/login");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      </main>
    );
  }

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-5xl gap-8">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col sm:flex">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  tab === item.key
                    ? "bg-white font-medium text-primary shadow-sm"
                    : "text-slate-600 hover:bg-white/60"
                }`}
              >
                <Icon d={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/60 hover:text-danger"
            >
              <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              Log out
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">{initials}</div>
            <span className="text-sm font-medium text-ink">{user.name.split(" ")[0]}</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-slate-500">Log out</button>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 pt-14 sm:pt-0">
          <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1 sm:hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  tab === item.key ? "bg-white text-primary shadow-sm" : "text-slate-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "profile" ? (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h1 className="text-lg font-semibold text-ink">Profile</h1>
                  <p className="text-sm text-slate-500">Your personal information</p>
                </div>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-ink hover:bg-slate-50">
                    Edit profile
                  </button>
                )}
              </div>

              <div className="px-6 py-5">
                {message && <div className="mb-4 rounded-lg bg-success-light px-4 py-2.5 text-sm text-success">{message}</div>}
                {error && <div className="mb-4 rounded-lg bg-danger-light px-4 py-2.5 text-sm text-danger">{error}</div>}

                {!editing ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Full name" value={user.name} />
                    <Field label="Email" value={user.email} />
                    <Field label="Phone" value={user.phone || "Not set"} muted={!user.phone} />
                    <Field label="Address" value={user.address || "Not set"} muted={!user.address} />
                    <Field label="Member since" value={new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <LabeledInput label="Full name" name="name" value={form.name} onChange={handleChange} />
                      <LabeledInput label="Phone" name="phone" value={form.phone} onChange={handleChange} />
                      <LabeledInput label="Address" name="address" value={form.address} onChange={handleChange} className="sm:col-span-2" />
                      <LabeledInput label="New password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" className="sm:col-span-2" />
                    </div>
                    <div className="flex gap-3 border-t border-slate-100 pt-5">
                      <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">Save changes</button>
                      <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-ink hover:bg-slate-50">Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">Delete account</p>
                  <p className="text-xs text-slate-500">This permanently removes your data.</p>
                </div>
                <button onClick={handleDelete} className="rounded-lg border border-danger/30 px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger-light">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <TodoList />
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, muted }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-sm ${muted ? "text-slate-400" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function LabeledInput({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}