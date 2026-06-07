"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatsCards } from "@/components/dashboard/StatsCards";

import { signOut } from "@/utils/auth";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError.message);
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Carregando...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#020817] text-white gap-4">
        <p className="text-red-400 font-bold text-lg">Erro ao carregar perfil</p>
        <p className="text-slate-500 text-sm max-w-md text-center">{error}</p>
        <button
          onClick={handleSignOut}
          className="mt-4 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition rounded-2xl px-6 py-3"
        >
          Sair e tentar novamente
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white flex">
      <Sidebar onSignOut={handleSignOut} />
      <section className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-6">
          <ProfileCard
            name={profile?.name}
            email={profile?.email}
            role={profile?.role}
          />
          <StatsCards />
          <div className="bg-slate-800 border border-slate-700 rounded-4xl p-8">
            <h2 className="text-3xl font-black mb-6">Conquistas</h2>
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                🏆 Profissional destaque
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                ⭐ Mais de 100 avaliações
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                🔒 Conta verificada
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
