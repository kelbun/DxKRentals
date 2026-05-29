import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import { createServerClient } from "@/lib/supabase/server";
import StatCard from "@/components/ui/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { formatCurrency } from "@/lib/utils/format";

export default async function RevenuePage() {
  const user = await getUser();
  if (!user || (user.role !== "admin" && user.role !== "partner")) redirect("/dashboard");

  const supabase = createServerClient();
  const { data: logs } = await supabase.from("revenue_logs").select("*").order("created_at");

  const totalRevenue = (logs || []).reduce((s: number, r: any) => s + r.amount, 0);
  const totalPartner = (logs || []).reduce((s: number, r: any) => s + r.partner_amount, 0);
  const totalPlatform = (logs || []).reduce((s: number, r: any) => s + r.platform_amount, 0);

  // Group by month for chart
  const grouped: Record<string, number> = {};
  (logs || []).forEach((r: any) => {
    const month = new Date(r.created_at).toLocaleString("default", { month: "short" });
    grouped[month] = (grouped[month] || 0) + r.amount;
  });
  const chartData = Object.entries(grouped).map(([month, total]) => ({ month, total }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-white">Revenue Analytics</h1>
        <p className="text-muted text-sm mt-1">Financial performance overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} subtext="All time" icon="◈" />
        <StatCard label="Partner Earnings" value={formatCurrency(totalPartner)} icon="◆" accentColor="#C6A55A" />
        <StatCard label="Platform Revenue" value={formatCurrency(totalPlatform)} icon="◎" accentColor="#60A5FA" />
      </div>
      <div className="bg-surface2 border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
        <h2 className="text-white font-semibold text-base mb-6">Monthly Revenue</h2>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <p className="text-muted text-sm text-center py-10">No revenue data yet.</p>
        )}
      </div>
    </div>
  );
}
