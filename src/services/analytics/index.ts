import { createClient } from "@/lib/supabase/client";

export async function getAdminStats() {
  const supabase = createClient();

  const [bookingsRes, revenueRes, carsRes] = await Promise.all([
    supabase.from("bookings").select("status, total_price, created_at"),
    supabase.from("revenue_logs").select("amount, partner_amount, platform_amount, created_at"),
    supabase.from("cars").select("status"),
  ]);

  const bookings = bookingsRes.data || [];
  const revenue = revenueRes.data || [];
  const cars = carsRes.data || [];

  const totalRevenue = revenue.reduce((s, r) => s + (r.amount || 0), 0);
  const activeRentals = bookings.filter((b) => b.status === "active").length;
  const pendingApprovals = bookings.filter((b) => b.status === "pending").length;
  const availableCars = cars.filter((c) => c.status === "available").length;

  return {
    totalRevenue,
    activeRentals,
    pendingApprovals,
    availableCars,
    totalCars: cars.length,
  };
}

export async function getMonthlyRevenue() {
  const supabase = createClient();
  const { data } = await supabase
    .from("revenue_logs")
    .select("amount, created_at")
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const month = row.created_at.slice(0, 7);
    grouped[month] = (grouped[month] || 0) + row.amount;
  });

  return Object.entries(grouped).map(([month, total]) => ({ month, total }));
}
