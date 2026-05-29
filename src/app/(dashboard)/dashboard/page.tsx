import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import { createServerClient } from "@/lib/supabase/server";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Booking } from "@/types";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createServerClient();

  if (user.role === "admin") {
    // Admin dashboard
    const [bookingsRes, carsRes, revenueRes] = await Promise.all([
      supabase.from("bookings").select("*, car:cars(name), user:users(full_name)").order("created_at", { ascending: false }).limit(10),
      supabase.from("cars").select("status"),
      supabase.from("revenue_logs").select("amount"),
    ]);

    const bookings = (bookingsRes.data || []) as (Booking & { car: { name: string }; user: { full_name: string } })[];
    const cars = carsRes.data || [];
    const totalRevenue = (revenueRes.data || []).reduce((s: number, r: { amount: number }) => s + r.amount, 0);
    const activeRentals = bookings.filter((b) => b.status === "active").length;
    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const availableCars = cars.filter((c) => c.status === "available").length;

    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-white">Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back — here&apos;s your overview.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} subtext="All time" icon="◈" />
          <StatCard label="Active Rentals" value={activeRentals} subtext="Currently out" icon="◆" accentColor="#22C55E" />
          <StatCard label="Pending Approval" value={pendingCount} subtext="Needs review" icon="◉" accentColor="#EAB308" />
          <StatCard label="Fleet Available" value={`${availableCars}/${cars.length}`} subtext="Vehicles ready" icon="◎" accentColor="#60A5FA" />
        </div>
        <div className="bg-surface2 border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
          <h2 className="text-white font-semibold text-base mb-5">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Customer", "Vehicle", "Dates", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs text-muted uppercase tracking-wider pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border/50">
                    <td className="py-3.5 pr-4 text-white text-sm">{b.user?.full_name || "—"}</td>
                    <td className="py-3.5 pr-4 text-muted text-sm">{b.car?.name || "—"}</td>
                    <td className="py-3.5 pr-4 text-muted text-xs">{formatDate(b.start_date)} – {formatDate(b.end_date)}</td>
                    <td className="py-3.5 pr-4 text-white text-sm font-semibold">{formatCurrency(b.total_price || 0)}</td>
                    <td className="py-3.5"><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Customer dashboard
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(name, brand, model, car_images(image_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-white">
          Welcome, {user.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted text-sm mt-1">Manage your bookings and profile.</p>
      </div>
      <div className="bg-surface2 border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
        <h2 className="text-white font-semibold text-base mb-5">Your Bookings</h2>
        {!bookings?.length ? (
          <p className="text-muted text-sm">No bookings yet. <a href="/cars" className="text-gold hover:underline">Browse our fleet →</a></p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: Booking & { car: { name: string } }) => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div>
                  <p className="text-white font-semibold text-sm">{b.car?.name}</p>
                  <p className="text-muted text-xs mt-1">{formatDate(b.start_date)} → {formatDate(b.end_date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-white font-bold text-sm">{formatCurrency(b.total_price || 0)}</p>
                  <Badge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
