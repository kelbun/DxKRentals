import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { carId: string } }) {
  const supabase = createServerClient();

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("start_date, end_date")
      .eq("car_id", params.carId)
      .in("status", ["approved", "active"]),
    supabase
      .from("blocked_dates")
      .select("start_date, end_date, reason")
      .eq("car_id", params.carId),
  ]);

  return NextResponse.json({
    bookings: bookingsRes.data || [],
    blocked: blockedRes.data || [],
  });
}
