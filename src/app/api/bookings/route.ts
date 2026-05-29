import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("bookings")
    .select("*, car:cars(name, brand, model), user:users(full_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Check availability
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("id")
    .eq("car_id", body.car_id)
    .in("status", ["approved", "active"])
    .lte("start_date", body.end_date)
    .gte("end_date", body.start_date);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "Vehicle not available for selected dates" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...body, user_id: session.user.id, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
