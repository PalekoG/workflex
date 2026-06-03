"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login realizado com sucesso!");

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-cyan-400">
            Login
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Entre na sua conta
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              E-mail
            </label>

            <input
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Senha
            </label>

            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 transition py-3 rounded-xl font-bold text-white"
          >
            Entrar
          </button>

        </form>

      </div>

    </main>
  );
}