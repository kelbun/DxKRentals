import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const featured = searchParams.get("featured");

  let query = supabase.from("cars").select("*, car_images(*)").eq("status", "available");
  if (brand) query = query.eq("brand", brand);
  if (featured === "true") query = query.eq("featured", true);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single();
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { data, error } = await supabase.from("cars").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
