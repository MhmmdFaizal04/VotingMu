"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="bg-[#128c7e] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-90 transition">
          VoteLive
        </Link>

        <nav className="flex items-center gap-1">
          {session ? (
            <>
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition hover:bg-white/10 ${pathname === "/" ? "bg-white/15" : ""}`}
              >
                Beranda
              </Link>
              <Link
                href="/polls/create"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition hover:bg-white/10 ${pathname === "/polls/create" ? "bg-white/15" : ""}`}
              >
                Buat Poll
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition hover:bg-white/10 ${pathname === "/profile" ? "bg-white/15" : ""}`}
              >
                Profil
              </Link>
              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  window.location.href = "/login";
                }}
                className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition">
                Masuk
              </Link>
              <Link href="/register" className="ml-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#25d366] hover:bg-[#1db954] transition">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
