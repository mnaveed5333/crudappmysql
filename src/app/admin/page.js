"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUsers(data.users))
      .catch(() => router.push("/admin/users/[id]"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this user permanently?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    else setError("Could not delete user.");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const activeCount = users.filter((u) => u.is_active !== false).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink md:text-2xl">Users</h1>
            <p className="text-sm text-slate-500">{users.length} total · {activeCount} active</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-slate-500 transition-colors hover:text-primary">
            Log out
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-danger-light px-4 py-2 text-sm text-danger">{error}</div>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-sm">
          <span className="text-slate-400"><Icon d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
              {filtered.map((u) => (
                <Link key={u.id} href={`/admin/users/${u.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">{u.name}</h2>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <StatusBadge active={u.is_active !== false} />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                    <span className="capitalize">{u.role}</span>
                    <span>{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => router.push(`/admin/users/${u.id}`)}
                      className="cursor-pointer text-ink transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5 font-medium">{u.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3.5"><span className="capitalize text-slate-600">{u.role}</span></td>
                      <td className="px-5 py-3.5"><StatusBadge active={u.is_active !== false} /></td>
                      <td className="px-5 py-3.5 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => handleDelete(e, u.id)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger-light"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">No users match "{search}".</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
      active ? "bg-success-light text-success" : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}