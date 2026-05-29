import { createServerClient } from "@/lib/supabase/server";
import type { User } from "@/types";

export async function getUser(): Promise<User | null> {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return data;
}

export async function requireRole(
  role: "admin" | "partner" | "customer"
): Promise<User> {
  const user = await getUser();
  if (!user) throw new Error("Unauthenticated");
  if (user.role !== role && user.role !== "admin")
    throw new Error("Unauthorized");
  return user;
}
