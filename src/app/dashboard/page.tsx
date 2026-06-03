"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatsCards } from "@/components/dashboard/StatsCards";

import { getUser } from "@/utils/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const user = await getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white flex">

      <Sidebar />

      <section className="flex-1 p-8 overflow-y-auto">

        <div className="space-y-6">

          <ProfileCard />

          <StatsCards />

          <div className="bg-slate-800 border border-slate-700 rounded-[32px] p-8">

            <h2 className="text-3xl font-black mb-6">
              Conquistas
            </h2>

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