import { supabase } from "@/lib/supabase";

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}