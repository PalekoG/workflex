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
  suggested_price: number | null;
  categories: { name: string; icon: string };
  services: { name: string };
  profiles: { name: string | null; phone: string | null };
};

type Proposal = {
  id: string;
  price: number;
  message: string | null;
  status: string;
  professional_id: string;
  request_id: string;
  profiles: { name: string | null; phone: string | null; email: string | null };
};

type RequestWithProposals = {
  id: string;
  description: string;
  scheduled_date: string;
  status: string;
  categories: { name: string; icon: string };
  services: { name: string };
  proposals: Proposal[];
};

function translatePeriod(period: string) {
  const map: Record<string, string> = {
    manha: "☀️ Manhã",
    tarde: "🌤️ Tarde",
    noite: "🌙 Noite",
  };
  return map[period] ?? period;
}

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
  const [clientRequests, setClientRequests] = useState<RequestWithProposals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingProposal, setAcceptingProposal] = useState<string | null>(null);

  async function loadDashboard() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

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

    if (profileData.role === "professional") {
      // Busca solicitações abertas SEM contato do cliente
      const { data: requestsData } = await supabase
        .from("service_requests")
        .select(`
          id,
          description,
          scheduled_date,
          period,
          status,
          created_at,
          suggested_price,
          categories ( name, icon ),
          services ( name ),
          profiles ( name )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      setRequests((requestsData as unknown as ServiceRequest[]) ?? []);
    }

    if (profileData.role === "client") {
      // Busca chamados do cliente com propostas
      const { data: clientData } = await supabase
        .from("service_requests")
        .select(`
          id,
          description,
          scheduled_date,
          status,
          categories ( name, icon ),
          services ( name ),
          proposals (
            id,
            price,
            message,
            status,
            professional_id,
            profiles ( name, phone, email )
          )
        `)
        .eq("client_id", session.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      const withProposals = (clientData as unknown as RequestWithProposals[])
        ?.filter((r) => r.proposals && r.proposals.length > 0) ?? [];

      setClientRequests(withProposals);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleAcceptProposal(proposalId: string, requestId: string) {
    setAcceptingProposal(proposalId);

    // Aceita a proposta
    await supabase
      .from("proposals")
      .update({ status: "accepted" })
      .eq("id", proposalId);

    // Rejeita as outras propostas do mesmo chamado
    await supabase
      .from("proposals")
      .update({ status: "rejected" })
      .eq("request_id", requestId)
      .neq("id", proposalId);

    // Atualiza o chamado para aceito
    await supabase
      .from("service_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    setAcceptingProposal(null);
    await loadDashboard();
  }

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
            phone={profile?.phone}
          />

          <StatsCards />

          {/* PROFISSIONAL — Solicitações na sua área */}
          {profile?.role === "professional" && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    📋 Solicitações na sua área
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Envie propostas — contato liberado só após aceite
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
                    Nenhuma solicitação no momento
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
                        <div className="flex-1 space-y-2">

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg">{req.categories?.icon}</span>
                            <span className="text-cyan-400 font-bold text-sm">
                              {req.categories?.name}
                            </span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-300 text-sm font-semibold">
                              {req.services?.name}
                            </span>
                          </div>

                          <p className="text-slate-300 text-sm leading-relaxed">
                            {req.description}
                          </p>

                          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                            <span>📅 {formatDate(req.scheduled_date)}</span>
                            <span>{translatePeriod(req.period)}</span>
                            {req.suggested_price && (
                              <span className="text-green-400 font-bold">
                                💰 Até R$ {req.suggested_price.toFixed(2)}
                              </span>
                            )}
                            {/* Nome do cliente mas SEM contato */}
                            <span className="text-slate-400">
                              👤 {req.profiles?.name ?? "Cliente"}
                            </span>
                          </div>

                        </div>

                        <button
                          onClick={() => router.push("/dashboard/servicos")}
                          className="bg-cyan-600 hover:bg-cyan-500 transition px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0"
                        >
                          Enviar proposta
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* CLIENTE — Propostas nos seus chamados */}
          {profile?.role === "client" && clientRequests.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">

              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">
                  💬 Propostas nos seus chamados
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Profissionais interessados nos seus serviços
                </p>
              </div>

              <div className="space-y-6">
                {clientRequests.map((req) => (
                  <div key={req.id} className="space-y-3">

                    {/* Chamado */}
                    <div className="flex items-center gap-2">
                      <span>{req.categories?.icon}</span>
                      <span className="text-cyan-400 font-bold text-sm">
                        {req.categories?.name}
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-slate-300 text-sm font-semibold">
                        {req.services?.name}
                      </span>
                      <span className="text-slate-600 text-xs ml-2">
                        {formatDate(req.scheduled_date)}
                      </span>
                    </div>

                    {/* Propostas */}
                    <div className="space-y-2 pl-2">
                      {req.proposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <p className="text-white font-bold text-sm">
                              👤 {proposal.profiles?.name ?? "Profissional"}
                            </p>
                            {proposal.message && (
                              <p className="text-slate-400 text-xs leading-relaxed">
                                {proposal.message}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-green-400 font-black text-lg">
                              R$ {proposal.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleAcceptProposal(proposal.id, req.id)}
                              disabled={acceptingProposal === proposal.id}
                              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 transition px-4 py-2 rounded-xl text-sm font-bold text-white"
                            >
                              {acceptingProposal === proposal.id
                                ? "Aceitando..."
                                : "✓ Aceitar"}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>

                    <div className="border-b border-slate-700" />
                  </div>
                ))}
              </div>

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