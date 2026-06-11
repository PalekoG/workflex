"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Proposal = {
  id: string;
  price: number;
  professional_id: string;
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
  profiles: { name: string | null; phone: string | null; email: string | null };
  proposals: Proposal[];
};

type Tab = "scheduled" | "active" | "completed" | "cancelled";

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

function isToday(date: string) {
  const today = new Date().toISOString().split("T")[0];
  return date === today;
}

function isFuture(date: string) {
  const today = new Date().toISOString().split("T")[0];
  return date > today;
}

function buildWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return "https://wa.me/55" + digits;
}

export default function AgendamentosPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("scheduled");
  const [userId, setUserId] = useState<string | null>(null);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "professional") {
      router.push("/dashboard");
      return;
    }

    setUserId(session.user.id);

    const { data } = await supabase
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
        profiles ( name, phone, email ),
        proposals (
          id,
          price,
          professional_id
        )
      `)
      .in("status", ["accepted", "completed", "cancelled"])
      .order("scheduled_date", { ascending: true });

    const mine = (data as unknown as ServiceRequest[])?.filter((req) =>
      req.proposals?.some((p) => p.professional_id === session.user.id)
    ) ?? [];

    setRequests(mine);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function getMyPrice(req: ServiceRequest) {
    return req.proposals?.find((p) => p.professional_id === userId)?.price ?? 0;
  }

  function getByTab(tab: Tab) {
    return requests.filter((req) => {
      if (tab === "scheduled") return req.status === "accepted" && isFuture(req.scheduled_date);
      if (tab === "active") return req.status === "accepted" && (isToday(req.scheduled_date) || !isFuture(req.scheduled_date));
      if (tab === "completed") return req.status === "completed";
      if (tab === "cancelled") return req.status === "cancelled";
      return false;
    });
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "scheduled", label: "Agendados", icon: "📅" },
    { key: "active", label: "Em andamento", icon: "🔄" },
    { key: "completed", label: "Finalizados", icon: "✅" },
    { key: "cancelled", label: "Cancelados", icon: "❌" },
  ];

  const filtered = getByTab(activeTab);

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

        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-500 hover:text-slate-300 transition text-sm mb-6 flex items-center gap-2"
          >
            ← Voltar ao dashboard
          </button>
          <h1 className="text-5xl font-black text-white">Meus Agendamentos</h1>
          <p className="text-slate-400 mt-2">
            Acompanhe os serviços que você irá realizar
          </p>
        </div>

        {/* Abas */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const count = getByTab(tab.key).length;
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

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-3xl">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400 font-semibold">
              Nenhum serviço {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="bg-slate-800 border border-slate-700 rounded-3xl p-6 space-y-4"
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
                  <span className="text-green-400 font-black text-lg">
                    R$ {getMyPrice(req).toFixed(2)}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-slate-300 text-sm leading-relaxed">
                  {req.description}
                </p>

                {/* Data */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>📅 {formatDate(req.scheduled_date)}</span>
                  <span>{translatePeriod(req.period)}</span>
                  {isToday(req.scheduled_date) && (
                    <span className="text-yellow-400 font-bold">⚡ HOJE</span>
                  )}
                </div>

                {/* Contato do cliente */}
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    Contato do cliente
                  </p>
                  <p className="text-white font-bold">
                    👤 {req.profiles?.name ?? "Cliente"}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {req.profiles?.phone && (
                      <a
                        href={buildWhatsAppUrl(req.profiles.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-bold transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}

                    {req.profiles?.email && (
                      <a
                        href={"mailto:" + req.profiles.email}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm transition"
                      >
                        📧 {req.profiles.email}
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}