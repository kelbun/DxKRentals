import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/types";

export async function getCars(filters?: {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: string;
  featured?: boolean;
}): Promise<Car[]> {
  const supabase = createClient();
  let query = supabase
    .from("cars")
    .select("*, car_images(*)")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (filters?.brand) query = query.eq("brand", filters.brand);
  if (filters?.minPrice) query = query.gte("daily_price", filters.minPrice);
  if (filters?.maxPrice) query = query.lte("daily_price", filters.maxPrice);
  if (filters?.seats) query = query.eq("seats", filters.seats);
  if (filters?.transmission) query = query.eq("transmission", filters.transmission);
  if (filters?.featured) query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getAllCarsAdmin(): Promise<Car[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*), partners(business_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCar(car: Partial<Car>): Promise<Car> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cars")
    .insert(car)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCar(id: string, updates: Partial<Car>): Promise<Car> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cars")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCar(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (error) throw error;
}
