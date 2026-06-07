// src/utils/auth.ts

import { supabase } from "@/lib/supabase";

// JÁ EXISTIA — não mexemos
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// NOVO — busca o perfil completo da tabela profiles
export async function getProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")   // nossa tabela
    .select("*")        // todos os campos
    .eq("id", user.id)  // filtra pelo id do usuário logado
    .single();          // retorna objeto, não array

  return profile;
}

// NOVO — faz logout
export async function signOut() {
  await supabase.auth.signOut();
}