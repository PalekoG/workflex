"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const isPasswordValid =
    hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!isPasswordValid) {
      alert("A senha não atende aos requisitos mínimos.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          name: name,
          email: email,
          role: "client",
        });

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError.message);
      }
    }

    alert("Conta criada! Verifique seu email para confirmar.");
    router.push("/login");
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-cyan-400">Criar Conta</h1>
          <p className="text-slate-400 mt-2 text-sm">Cadastre-se no WorkFlex</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="block text-sm text-slate-300 mb-2">Nome</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">E-mail</label>
            <input
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Senha</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 text-sm">
            <p className={hasMinLength ? "text-green-400" : "text-slate-400"}>
              {hasMinLength ? "✅" : "❌"} Mínimo de 8 caracteres
            </p>
            <p className={hasUpperCase ? "text-green-400" : "text-slate-400"}>
              {hasUpperCase ? "✅" : "❌"} Pelo menos 1 letra maiúscula
            </p>
            <p className={hasNumber ? "text-green-400" : "text-slate-400"}>
              {hasNumber ? "✅" : "❌"} Pelo menos 1 número
            </p>
            <p className={hasSpecialChar ? "text-green-400" : "text-slate-400"}>
              {hasSpecialChar ? "✅" : "❌"} Pelo menos 1 caractere especial
            </p>
          </div>

          <button
            type="submit"
            disabled={!isPasswordValid || loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 transition py-3 rounded-xl font-bold text-white disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>

        </form>
      </div>
    </main>
  );
}