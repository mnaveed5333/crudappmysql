"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminUserDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setRole(data.user.role);
      })
      .catch(() => router.push("/admin/login"));
  }, [id, router]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const payload = { role };

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to update role.");
      return;
    }
    setUser(data.user);
    setMessage("User role updated successfully.");
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this user account? This action is absolute and cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin");
    else setError("Could not delete user.");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50/50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      </main>
    );
  }

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 md:py-14 antialiased">
      <div className="mx-auto max-w-3xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/admin" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Users Management
          </Link>
        </div>

        {/* Dynamic Status Notifications */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm animate-in fade-in duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-800 shadow-sm animate-in fade-in duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}

        {/* Master Identity Panel */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-xl font-bold text-primary tracking-wider shadow-inner">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-0.5">{user.name}</h1>
              <p className="text-sm font-medium text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="sm:self-center">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
              user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-slate-100 text-slate-700 border border-slate-200/40'
            }`}>
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Information Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Profile Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">System recorded metadata variables (Read-Only).</p>
            </div>
            
            {/* Split Details Grid */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <StaticField label="Full Identification Name" value={user.name} />
              <StaticField label="Primary Email Address" value={user.email} />
              <StaticField label="Telephone Contact" value={user.phone || "No phone listed"} />
              <StaticField label="System Access Registration" value={new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: "long" })} />
              
              {/* Full Address Block - Takes 2 column width and displays everything */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Physical Address</span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 whitespace-pre-wrap break-words">
                  {user.address || "No spatial location data recorded for this account."}
                </p>
              </div>
            </div>
          </div>

          {/* Authorization Controller Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-0.5">Access Authorization</h2>
              <p className="text-xs text-slate-500">Elevate or limit this account's operational hierarchy privileges.</p>
            </div>
            
            <div className="max-w-xs">
              <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">System Operational Role</label>
              <div className="relative">
                <select 
                  name="role" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white pl-4 pr-10 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="user">Standard User Role</option>
                  <option value="admin">Admin Role</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-200/60 bg-rose-50/20 p-6">
            <div className="min-w-0">
              <p className="text-sm font-bold text-rose-900">Destructive Actions Zone</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-md">Completely wipe this profile instance and purge all parameters cleanly out of the storage core.</p>
            </div>
            <button 
              type="button" 
              onClick={handleDelete} 
              className="w-full sm:w-auto shrink-0 rounded-xl bg-white border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 shadow-sm hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] transition-all"
            >
              Delete Account
            </button>
          </div>

          {/* Sticky Context Actions Bar */}
          <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-md backdrop-blur-md">
            <Link href="/admin" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving || role === user.role} 
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all"
            >
              {saving ? "Saving Changes..." : "Save Tier Role"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// Fixed Premium Read-only Field Component
function StaticField({ label, value }) {
  return (
    <div className="flex flex-col border-b border-slate-100/60 pb-3 sm:border-none sm:pb-0">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm font-semibold text-slate-800 break-all">{value}</span>
    </div>
  );
}