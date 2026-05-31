import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await supabase
    .from("users").select("role").eq("id", session.user.id).single();
  if (user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status, payment_notes } = await request.json();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, ...(payment_notes ? { payment_notes } : {}) })
    .eq("id", params.id)
    .select("*, car:cars(name), user:users(full_name, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
