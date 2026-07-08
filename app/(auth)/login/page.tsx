"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registered = params.get("registered") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email atau password salah");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#25d366] mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111b21]">VoteLive</h1>
          <p className="text-[#667781] text-sm mt-1">Polling real-time untuk semua orang</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e9edef] p-8">
          <h2 className="text-xl font-semibold text-[#111b21] mb-6">Masuk</h2>

          {registered && (
            <div className="bg-green-50 border border-[#25d366] text-[#128c7e] rounded-lg px-4 py-3 text-sm mb-4">
              Akun berhasil dibuat! Silakan masuk.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111b21] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@contoh.com"
                className="w-full px-4 py-2.5 rounded-lg border border-[#e9edef] bg-[#f0f2f5] text-[#111b21] placeholder-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111b21] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password kamu"
                className="w-full px-4 py-2.5 rounded-lg border border-[#e9edef] bg-[#f0f2f5] text-[#111b21] placeholder-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#25d366] text-white font-semibold hover:bg-[#128c7e] active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-[#667781] mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#25d366] font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
