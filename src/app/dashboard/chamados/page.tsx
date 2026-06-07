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

type Tab = "pending" | "accepted" | "completed" | "cancelled";

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Aguardando propostas",
      className: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    },
    accepted: {
      label: "Em andamento",
      className: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    },
    completed: {
      label: "Concluído",
      className: "bg-green-500/10 border-green-500/30 text-green-400",
    },
    cancelled: {
      label: "Cancelado",
      className: "bg-red-500/10 border-red-500/30 text-red-400",
    },
  };

  const s = map[status] ?? map.pending;

  return (
    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${s.className}`}>
      {s.label}
    </span>
  );
}

export default function ChamadosPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function loadRequests() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
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
      .eq("client_id", session.user.id)
      .order("created_at", { ascending: false });

    setRequests((data as unknown as ServiceRequest[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleCancel(id: string) {
    const confirmed = confirm("Tem certeza que deseja cancelar este chamado?");
    if (!confirmed) return;

    setCancelling(id);

    const { error } = await supabase
      .from("service_requests")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", "pending"); // só cancela se ainda estiver pendente

    if (error) {
      alert("Erro ao cancelar: " + error.message);
      setCancelling(null);
      return;
    }

    await loadRequests();
    setCancelling(null);
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "pending", label: "Abertos", icon: "📋" },
    { key: "accepted", label: "Em andamento", icon: "🔄" },
    { key: "completed", label: "Concluídos", icon: "✅" },
    { key: "cancelled", label: "Cancelados", icon: "❌" },
  ];

  const filtered = requests.filter((r) => r.status === activeTab);

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
          <h1 className="text-5xl font-black text-white">Meus Chamados</h1>
          <p className="text-slate-400 mt-2">
            Acompanhe todas as suas solicitações de serviço
          </p>
        </div>

        {/* Abas */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const count = requests.filter((r) => r.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold transition text-sm ${
                  activeTab === tab.key
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                    activeTab === tab.key
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lista de chamados */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-3xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 font-semibold">
              Nenhum chamado {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}
            </p>
            {activeTab === "pending" && (
              <button
                onClick={() => router.push("/solicitar")}
                className="mt-4 bg-cyan-600 hover:bg-cyan-500 transition px-6 py-3 rounded-xl font-bold text-white text-sm"
              >
                Solicitar serviço agora
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="bg-slate-800 border border-slate-700 hover:border-slate-500 transition rounded-3xl p-6 space-y-4"
              >
                {/* Topo */}
                <div className="flex items-start justify-between gap-4">
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
                  <StatusBadge status={req.status} />
                </div>

                {/* Descrição */}
                <p className="text-slate-300 text-sm leading-relaxed">
                  {req.description}
                </p>

                {/* Detalhes */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                  <span>📅 {formatDate(req.scheduled_date)}</span>
                  <span>{translatePeriod(req.period)}</span>
                  {req.suggested_price ? (
                    <span className="text-green-400 font-bold">
                      💰 Até R$ {req.suggested_price.toFixed(2)}
                    </span>
                  ) : (
                    <span>📩 Aberto a propostas</span>
                  )}
                  <span>
                    Aberto em {new Date(req.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                {/* Botão cancelar — só em chamados pendentes */}
                {req.status === "pending" && (
                  <div className="pt-2 border-t border-slate-700">
                    <button
                      onClick={() => handleCancel(req.id)}
                      disabled={cancelling === req.id}
                      className="text-red-400 hover:text-red-300 text-sm font-semibold transition disabled:opacity-50"
                    >
                      {cancelling === req.id ? "Cancelando..." : "✕ Cancelar chamado"}
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}