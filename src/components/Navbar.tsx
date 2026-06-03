"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link href="/">
          <div className="cursor-pointer">
            <h1 className="text-2xl font-black text-cyan-400">
              WorkFlex
            </h1>

            <p className="text-xs text-slate-500">
              Plataforma inteligente de serviços
            </p>
          </div>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex gap-3">

          <Link href="/login">
            <button className="px-4 py-2 rounded-xl bg-slate-800 text-sm hover:bg-slate-700 transition cursor-pointer">
              Login
            </button>
          </Link>

          <Link href="/register">
            <button className="px-4 py-2 rounded-xl bg-cyan-600 text-sm font-semibold hover:bg-cyan-500 transition cursor-pointer">
              Criar Conta
            </button>
          </Link>

        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-3xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-slate-950 border-t border-slate-800">

          <Link href="/login">
            <button className="w-full px-4 py-3 rounded-xl bg-slate-800 text-sm">
              Login
            </button>
          </Link>

          <Link href="/register">
            <button className="w-full px-4 py-3 rounded-xl bg-cyan-600 text-sm font-semibold">
              Criar Conta
            </button>
          </Link>

        </div>
      )}
    </header>
  );
}