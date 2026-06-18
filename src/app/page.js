import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-semibold text-ink">User Management</h1>
      <p className="text-slate-500">Sign in to view your dashboard, or create a new account.</p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary-hover">
          Login
        </Link>
        <Link href="/register" className="rounded-lg border border-slate-300 px-5 py-2.5 text-ink hover:bg-slate-50">
          Register
        </Link>
      </div>
      <Link href="/admin/login" className="text-sm text-slate-400 hover:text-primary">
        Admin Login
      </Link>
    </main>
  );
}