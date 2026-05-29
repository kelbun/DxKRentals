import { createClient } from "@/lib/supabase/client";
import type { BlockedDate } from "@/types";

export async function getUnavailableDates(carId: string): Promise<{
  bookings: { start_date: string; end_date: string }[];
  blocked: BlockedDate[];
}> {
  const supabase = createClient();

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("start_date, end_date")
      .eq("car_id", carId)
      .in("status", ["approved", "active"]),
    supabase
      .from("blocked_dates")
      .select("*")
      .eq("car_id", carId),
  ]);

  return {
    bookings: bookingsRes.data || [],
    blocked: blockedRes.data || [],
  };
}

export async function checkAvailability(
  carId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("car_id", carId)
    .in("status", ["approved", "active"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  return !data || data.length === 0;
}

export async function blockDates(
  carId: string,
  startDate: string,
  endDate: string,
  reason?: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("blocked_dates").insert({
    car_id: carId,
    start_date: startDate,
    end_date: endDate,
    reason,
  });
  if (error) throw error;
}
