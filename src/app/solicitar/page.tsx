"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Category = {
  id: number;
  name: string;
  icon: string;
};

type Service = {
  id: number;
  name: string;
  category_id: number;
};

export default function SolicitarPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState("manha");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [openToProposals, setOpenToProposals] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: cats } = await supabase
        .from("categories").select("*").order("name");
      const { data: servs } = await supabase
        .from("services").select("*").order("name");

      setCategories(cats ?? []);
      setServices(servs ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredServices([]);
      setSelectedService(null);
      return;
    }
    setFilteredServices(services.filter((s) => s.category_id === selectedCategory));
    setSelectedService(null);
  }, [selectedCategory, services]);

  async function handleSubmit() {
    if (!selectedCategory || !selectedService || !description || !date) {
      alert("Preencha todos os campos antes de enviar.");
      return;
    }

    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    const { error } = await supabase
      .from("service_requests")
      .insert({
        client_id: session.user.id,
        category_id: selectedCategory,
        service_id: selectedService,
        description,
        scheduled_date: date,
        period,
        suggested_price: suggestedPrice ? parseFloat(suggestedPrice) : null,
        open_to_proposals: openToProposals,
      });

    if (error) {
      alert("Erro ao enviar solicitação: " + error.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
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

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#020817] text-white px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">🎉</div>
          <h1 className="text-4xl font-black text-white">Solicitação enviada!</h1>
          <p className="text-slate-400 text-lg">
            Profissionais da sua área enviarão propostas em breve.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/dashboard/chamados")}
              className="w-full bg-cyan-600 hover:bg-cyan-500 transition py-3 rounded-xl font-bold text-white"
            >
              Ver meus chamados
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setSelectedCategory(null);
                setSelectedService(null);
                setDescription("");
                setDate("");
                setPeriod("manha");
                setSuggestedPrice("");
                setOpenToProposals(true);
              }}
              className="w-full border border-slate-700 hover:bg-slate-800 transition py-3 rounded-xl text-slate-300"
            >
              Fazer outra solicitação
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-500 hover:text-slate-300 transition text-sm mb-6 flex items-center gap-2"
          >
            ← Voltar ao dashboard
          </button>
          <h1 className="text-5xl font-black text-white">Solicitar Serviço</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Descreva o que você precisa e receba propostas de profissionais
          </p>
        </div>

        {/* Passo 1 — Categoria */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 space-y-4">
          <div>
            <span className="text-cyan-400 text-sm font-bold">PASSO 1</span>
            <h2 className="text-2xl font-black text-white mt-1">Qual categoria de serviço?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition text-left ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Passo 2 — Serviço específico */}
        {selectedCategory && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 space-y-4">
            <div>
              <span className="text-cyan-400 text-sm font-bold">PASSO 2</span>
              <h2 className="text-2xl font-black text-white mt-1">Qual serviço específico?</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredServices.map((serv) => (
                <button
                  key={serv.id}
                  onClick={() => setSelectedService(serv.id)}
                  className={`rounded-xl px-4 py-3 border transition text-left ${
                    selectedService === serv.id
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <span className="text-sm font-semibold">{serv.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Passo 3 — Detalhes */}
        {selectedService && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 space-y-6">
            <div>
              <span className="text-cyan-400 text-sm font-bold">PASSO 3</span>
              <h2 className="text-2xl font-black text-white mt-1">Detalhes do serviço</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Descreva o problema ou serviço necessário
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Preciso instalar 3 tomadas novas na sala..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Data preferencial
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Período preferencial
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "manha", label: "☀️ Manhã" },
                  { value: "tarde", label: "🌤️ Tarde" },
                  { value: "noite", label: "🌙 Noite" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`py-3 rounded-xl border font-semibold transition ${
                      period === p.value
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div className="border border-slate-700 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold">💰 Valor do serviço</h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOpenToProposals(false)}
                  className={`py-3 rounded-xl border font-semibold transition text-sm ${
                    !openToProposals
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  💵 Definir valor máximo
                </button>
                <button
                  onClick={() => { setOpenToProposals(true); setSuggestedPrice(""); }}
                  className={`py-3 rounded-xl border font-semibold transition text-sm ${
                    openToProposals
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  📩 Receber propostas
                </button>
              </div>

              {!openToProposals && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Valor máximo que você pagaria
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      R$
                    </span>
                    <input
                      type="number"
                      value={suggestedPrice}
                      onChange={(e) => setSuggestedPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              )}

              {openToProposals && (
                <p className="text-slate-500 text-sm">
                  Profissionais enviarão propostas com seus valores. Você escolhe a melhor.
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition py-4 rounded-xl font-black text-white text-lg"
            >
              {submitting ? "Enviando..." : "🚀 Solicitar Serviço"}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}