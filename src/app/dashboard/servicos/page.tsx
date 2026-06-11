"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ServiceRequest = {
  id: string;
  description: string;
  scheduled_date: string;
  period: string;
  status: string;
  created_at: string;
  suggested_price: number | null;
  open_to_proposals: boolean;
  categories: { name: string; icon: string };
  services: { name: string };
};

type MyProposal = {
  request_id: string;
  price: number;
  message: string | null;
  status: string;
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

export default function ServicosPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [myProposals, setMyProposals] = useState<MyProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle do modal de proposta
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    // Verifica se é profissional
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "professional") {
      router.push("/dashboard");
      return;
    }

    // Busca chamados abertos
    const { data: reqs } = await supabase
      .from("service_requests")
      .select(`
        id,
        description,
        scheduled_date,
        period,
        status,
        created_at,
        suggested_price,
        open_to_proposals,
        categories ( name, icon ),
        services ( name )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Busca propostas que já enviei
    const { data: proposals } = await supabase
      .from("proposals")
      .select("request_id, price, message, status")
      .eq("professional_id", session.user.id);

    setRequests((reqs as unknown as ServiceRequest[]) ?? []);
    setMyProposals((proposals as MyProposal[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function alreadyProposed(requestId: string) {
    return myProposals.find((p) => p.request_id === requestId);
  }

  async function handleSubmitProposal() {
    if (!selectedRequest || !proposalPrice) {
      alert("Informe o valor da proposta.");
      return;
    }

    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("proposals")
      .insert({
        request_id: selectedRequest.id,
        professional_id: session.user.id,
        price: parseFloat(proposalPrice),
        message: proposalMessage || null,
      });

    if (error) {
      alert("Erro ao enviar proposta: " + error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSelectedRequest(null);
    setProposalPrice("");
    setProposalMessage("");
    await load();
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

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Cabeçalho */}
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-500 hover:text-slate-300 transition text-sm mb-6 flex items-center gap-2"
          >
            ← Voltar ao dashboard
          </button>
          <h1 className="text-5xl font-black text-white">Chamados Abertos</h1>
          <p className="text-slate-400 mt-2">
            Envie propostas para os clientes que precisam dos seus serviços
          </p>
        </div>

        {/* Lista de chamados */}
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-3xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 font-semibold">
              Nenhum chamado aberto no momento
            </p>
            <p className="text-slate-600 text-sm mt-1">
              Novos chamados aparecerão aqui automaticamente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const myProposal = alreadyProposed(req.id);

              return (
                <div
                  key={req.id}
                  className="bg-slate-800 border border-slate-700 hover:border-slate-500 transition rounded-3xl p-6 space-y-4"
                >
                  {/* Topo */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">

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
                        {req.suggested_price ? (
                          <span className="text-green-400 font-bold">
                            💰 Cliente oferece até R$ {req.suggested_price.toFixed(2)}
                          </span>
                        ) : (
                          <span>📩 Aberto a propostas</span>
                        )}
                      </div>

                    </div>

                    {/* Status da proposta */}
                    <div className="shrink-0">
                      {myProposal ? (
                        <div className="text-right space-y-1">
                          <span className="block text-xs text-slate-500">Sua proposta</span>
                          <span className="block text-green-400 font-black text-lg">
                            R$ {myProposal.price.toFixed(2)}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                            myProposal.status === "accepted"
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : myProposal.status === "rejected"
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                          }`}>
                            {myProposal.status === "accepted" ? "✓ Aceita" :
                             myProposal.status === "rejected" ? "✕ Recusada" :
                             "⏳ Aguardando"}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setProposalPrice(req.suggested_price?.toString() ?? "");
                          }}
                          className="bg-cyan-600 hover:bg-cyan-500 transition px-5 py-2 rounded-xl text-sm font-bold text-white"
                        >
                          Enviar proposta
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal de proposta */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md space-y-6">

            <div>
              <h2 className="text-2xl font-black text-white">Enviar Proposta</h2>
              <p className="text-slate-400 text-sm mt-1">
                {selectedRequest.categories?.icon} {selectedRequest.services?.name}
              </p>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Seu valor pelo serviço
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  R$
                </span>
                <input
                  type="number"
                  value={proposalPrice}
                  onChange={(e) => setProposalPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
              {selectedRequest.suggested_price && (
                <p className="text-slate-500 text-xs mt-1">
                  Cliente oferece até R$ {selectedRequest.suggested_price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Mensagem para o cliente (opcional)
              </label>
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="Ex: Tenho 10 anos de experiência nesse tipo de serviço..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setProposalPrice("");
                  setProposalMessage("");
                }}
                className="flex-1 border border-slate-700 hover:bg-slate-800 transition py-3 rounded-xl text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitProposal}
                disabled={submitting}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition py-3 rounded-xl font-bold text-white"
              >
                {submitting ? "Enviando..." : "Enviar proposta"}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}