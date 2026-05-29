import { createClient } from "@/lib/supabase/client";
import type { Booking, BookingStatus } from "@/types";

export async function createBooking(booking: {
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  notes?: string;
}): Promise<Booking> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...booking, user_id: user.id, status: "pending" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*, car:cars(*, car_images(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllBookingsAdmin(): Promise<Booking[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, car:cars(name, brand, model), user:users(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  paymentNotes?: string
): Promise<void> {
  const supabase = createClient();
  const updates: Partial<Booking> = { status };
  if (paymentNotes) updates.payment_notes = paymentNotes;

  const { error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}
