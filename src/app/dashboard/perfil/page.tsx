"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  bio: string | null;
  phone: string | null;
};

type Category = {
  id: number;
  name: string;
  icon: string;
};

export default function PerfilPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Campos do formulário
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

  // Categorias
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Busca perfil
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setName(profileData.name ?? "");
      setRole(profileData.role ?? "client");
      setBio(profileData.bio ?? "");
      setPhone(profileData.phone ?? "");

      // Busca todas as categorias
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, icon")
        .order("name");

      setAllCategories(cats ?? []);

      // Busca categorias já selecionadas pelo profissional
      const { data: selected } = await supabase
        .from("profile_categories")
        .select("category_id")
        .eq("profile_id", session.user.id);

      setSelectedCategories(selected?.map((s) => s.category_id) ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  // Alterna seleção de categoria
  function toggleCategory(id: number) {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)  // remove se já estava
        : [...prev, id]                  // adiciona se não estava
    );
  }

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    setSuccess(false);

    // 1 — Salva dados do perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name, role, bio, phone })
      .eq("id", profile.id);

    if (profileError) {
      alert("Erro ao salvar perfil: " + profileError.message);
      setSaving(false);
      return;
    }

    // 2 — Salva categorias (só se for profissional)
    if (role === "professional") {
      // Remove todas as categorias antigas
      await supabase
        .from("profile_categories")
        .delete()
        .eq("profile_id", profile.id);

      // Insere as novas selecionadas
      if (selectedCategories.length > 0) {
        const inserts = selectedCategories.map((category_id) => ({
          profile_id: profile.id,
          category_id,
        }));

        const { error: catError } = await supabase
          .from("profile_categories")
          .insert(inserts);

        if (catError) {
          alert("Erro ao salvar categorias: " + catError.message);
          setSaving(false);
          return;
        }
      }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
    <main className="min-h-screen bg-[#020817] text-white flex">

      {/* Sidebar */}
      <aside className="w-[280px] min-h-screen bg-[#020817] border-r border-slate-800 p-6 flex flex-col">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-cyan-400">WorkFlex</h1>
          <p className="text-slate-500 mt-1">Plataforma inteligente</p>
        </div>
        <nav className="space-y-3 flex-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300"
          >
            Dashboard
          </button>
          <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
            Serviços
          </button>
          <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
            Clientes
          </button>
          <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
            Agendamentos
          </button>
          <button className="w-full hover:bg-slate-800 transition rounded-2xl px-5 py-4 text-left text-slate-300">
            Financeiro
          </button>
          <button className="w-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl px-5 py-4 text-left font-semibold">
            Perfil
          </button>
        </nav>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="w-full mt-6 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition rounded-2xl px-5 py-4 text-left font-semibold"
        >
          → Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <section className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Cabeçalho */}
          <div>
            <h1 className="text-4xl font-black text-white">Meu Perfil</h1>
            <p className="text-slate-400 mt-1">Atualize suas informações pessoais</p>
          </div>

          {/* Formulário principal */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 space-y-6">

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tipo de conta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("client")}
                  className={`rounded-xl px-4 py-3 font-semibold border transition ${
                    role === "client"
                      ? "bg-violet-500/10 border-violet-500/40 text-violet-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  👤 Cliente
                </button>
                <button
                  onClick={() => setRole("professional")}
                  className={`rounded-xl px-4 py-3 font-semibold border transition ${
                    role === "professional"
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  🔧 Profissional
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Bio / Descrição
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Fale um pouco sobre você ou seus serviços..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition"
              />
            </div>

          </div>

          {/* Seção de categorias — só aparece para profissionais */}
          {role === "professional" && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 space-y-4">

              <div>
                <h2 className="text-xl font-black text-white">
                  Áreas de atuação
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Selecione todas as categorias em que você presta serviço
                </p>
              </div>

              {/* Grid de categorias */}
              <div className="grid grid-cols-2 gap-3">
                {allCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition text-left ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-semibold">{cat.name}</span>
                      {isSelected && (
                        <span className="ml-auto text-cyan-400 text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contador de selecionadas */}
              <p className="text-slate-500 text-sm">
                {selectedCategories.length} categoria(s) selecionada(s)
              </p>

            </div>
          )}

          {/* Botão salvar */}
          <div className="flex items-center gap-4 pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition px-8 py-3 rounded-xl font-bold text-white"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>

            {success && (
              <span className="text-green-400 font-semibold text-sm">
                ✅ Perfil atualizado com sucesso!
              </span>
            )}
          </div>

        </div>
      </section>

    </main>
  );
}