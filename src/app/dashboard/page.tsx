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
  phone: string | null;
};

type ServiceRequest = {
  id: string;
  description: string;
  scheduled_date: string;
  period: string;
  status: string;
  created_at: string;
  categories: { name: string; icon: string };
  services: { name: string };
  profiles: { name: string | null; phone: string | null };
};

// Traduz o período para português
function translatePeriod(period: string) {
  const map: Record<string, string> = {
    manha: "☀️ Manhã",
    tarde: "🌤️ Tarde",
    noite: "🌙 Noite",
  };
  return map[period] ?? period;
}

// Formata a data para português
function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Busca perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Se for profissional, busca solicitações da sua área
      if (profileData.role === "professional") {
        const { data: requestsData } = await supabase
          .from("service_requests")
          .select(`
            id,
            description,
            scheduled_date,
            period,
            status,
            created_at,
            categories ( name, icon ),
            services ( name ),
            profiles ( name, phone )
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(20);

        setRequests((requestsData as unknown as ServiceRequest[]) ?? []);
      }

      setLoading(false);
    }

    loadDashboard();
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

          {/* Feed de solicitações — só para profissionais */}
          {profile?.role === "professional" && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    📋 Solicitações na sua área
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Clientes buscando profissionais nas suas categorias
                  </p>
                </div>
                <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-sm font-bold">
                  {requests.length} abertas
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-slate-400 font-semibold">
                    Nenhuma solicitação aberta no momento
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Novas solicitações aparecerão aqui automaticamente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-900 border border-slate-700 hover:border-slate-500 transition rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex-1 space-y-3">

                          {/* Categoria e serviço */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg">
                              {req.categories?.icon}
                            </span>
                            <span className="text-cyan-400 font-bold text-sm">
                              {req.categories?.name}
                            </span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-300 text-sm font-semibold">
                              {req.services?.name}
                            </span>
                          </div>

                          {/* Descrição */}
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {req.description}
                          </p>

                          {/* Data e período */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              📅 {formatDate(req.scheduled_date)}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {translatePeriod(req.period)}
                            </span>
                            <span className="text-slate-600 text-xs">
                              Enviado {new Date(req.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>

                        </div>

                        {/* Botão de interesse */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {req.profiles?.phone ? (
                            <a
                              href={`https://wa.me/55${req.profiles.phone.replace(/\D/g, "")}?text=Olá! Vi sua solicitação no WorkFlex sobre "${req.services?.name}" e tenho interesse em ajudar.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-bold transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                              </svg>
                              Entrar em contato
                            </a>
                          ) : (
                            <span className="text-slate-600 text-xs italic">
                              Sem WhatsApp cadastrado
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Conquistas */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
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