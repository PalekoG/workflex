"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  name: string | null;
  role: string | null;
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Navbar() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
  }

  const initials = getInitials(profile?.name);
  const firstName = profile?.name?.split(" ")[0] ?? "Usuário";
  const isProfessional = profile?.role === "professional";

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <div className="cursor-pointer">
            <h1 className="text-2xl font-black text-cyan-400">WorkFlex</h1>
            <p className="text-xs text-slate-500">Plataforma inteligente de serviços</p>
          </div>
        </Link>

        {/* Desktop */}
        {!loading && (
          <nav className="hidden md:flex items-center gap-3">

            {profile ? (
              <>
                {isProfessional ? (
                  <Link href="/dashboard/servicos">
                    <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold transition">
                      🔧 Meus Serviços
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard/chamados">
                      <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition">
                        📋 Meus Chamados
                      </button>
                    </Link>
                    <Link href="/solicitar">
                      <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold transition">
                        Solicitar Serviço
                      </button>
                    </Link>
                  </>
                )}

                {/* Avatar + Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition rounded-xl px-3 py-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-black text-white select-none">
                      {initials}
                    </div>
                    <span className="text-sm text-white font-semibold">{firstName}</span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl">

                      <div className="px-3 py-2 mb-1 border-b border-slate-700">
                        <p className="text-white font-semibold text-sm">{profile.name}</p>
                        <p className="text-slate-400 text-xs">
                          {isProfessional ? "✦ Profissional" : "◈ Cliente"}
                        </p>
                      </div>

                      <Link href="/dashboard">
                        <button
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
                        >
                          🏠 Dashboard
                        </button>
                      </Link>

                      <Link href="/dashboard/perfil">
                        <button
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
                        >
                          👤 Meu Perfil
                        </button>
                      </Link>

                      {!isProfessional && (
                        <Link href="/dashboard/chamados">
                          <button
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
                          >
                            📋 Meus Chamados
                          </button>
                        </Link>
                      )}

                      {isProfessional && (
                        <Link href="/dashboard/servicos">
                          <button
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
                          >
                            🔧 Meus Serviços
                          </button>
                        </Link>
                      )}

                      <Link href="/dashboard/financeiro">
                        <button
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
                        >
                          💰 Financeiro
                        </button>
                      </Link>

                      <Link href="/dashboard/agendamentos">
                        <button
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition"
                        >
                          📅 Agendamentos
                        </button>
                      </Link>

                      <div className="border-t border-slate-700 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition"
                        >
                          → Sair
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 rounded-xl bg-slate-800 text-sm hover:bg-slate-700 transition">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 rounded-xl bg-cyan-600 text-sm font-semibold hover:bg-cyan-500 transition">
                    Criar Conta
                  </button>
                </Link>
              </>
            )}

          </nav>
        )}

        {/* Mobile button */}
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

          {profile ? (
            <>
              <div className="flex items-center gap-3 py-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{profile.name}</p>
                  <p className="text-slate-400 text-xs">
                    {isProfessional ? "Profissional" : "Cliente"}
                  </p>
                </div>
              </div>

              <Link href="/dashboard">
                <button className="w-full px-4 py-3 rounded-xl bg-slate-800 text-sm text-left">
                  🏠 Dashboard
                </button>
              </Link>

              {isProfessional ? (
                <Link href="/dashboard/servicos">
                  <button className="w-full px-4 py-3 rounded-xl bg-cyan-600 text-sm font-semibold text-left">
                    🔧 Meus Serviços
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/dashboard/chamados">
                    <button className="w-full px-4 py-3 rounded-xl bg-violet-600 text-sm font-semibold text-left">
                      📋 Meus Chamados
                    </button>
                  </Link>
                  <Link href="/solicitar">
                    <button className="w-full px-4 py-3 rounded-xl bg-cyan-600 text-sm font-semibold text-left">
                      Solicitar Serviço
                    </button>
                  </Link>
                </>
              )}

              <Link href="/dashboard/perfil">
                <button className="w-full px-4 py-3 rounded-xl bg-slate-800 text-sm text-left">
                  👤 Meu Perfil
                </button>
              </Link>

              <Link href="/dashboard/financeiro">
                <button className="w-full px-4 py-3 rounded-xl bg-slate-800 text-sm text-left">
                  💰 Financeiro
                </button>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm text-left"
              >
                → Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="w-full px-4 py-3 rounded-xl bg-slate-800 text-sm">Login</button>
              </Link>
              <Link href="/register">
                <button className="w-full px-4 py-3 rounded-xl bg-cyan-600 text-sm font-semibold">
                  Criar Conta
                </button>
              </Link>
            </>
          )}

        </div>
      )}

    </header>
  );
}