import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import { createServerClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function BookingsAdminPage() {
  const user = await getUser();
  if (!user || (user.role !== "admin" && user.role !== "partner")) redirect("/dashboard");

  const supabase = createServerClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, car:cars(name, brand), user:users(full_name, email, phone)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-white">Booking Management</h1>
        <p className="text-muted text-sm mt-1">{bookings?.length || 0} total bookings</p>
      </div>
      <div className="bg-surface2 border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Customer", "Vehicle", "Dates", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-muted uppercase tracking-wider pb-3 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(bookings || []).map((b: any) => (
                <tr key={b.id} className="border-b border-border/50">
                  <td className="py-4 pr-4 text-gold text-xs font-mono">{b.id.slice(0, 8)}</td>
                  <td className="py-4 pr-4">
                    <p className="text-white text-sm">{b.user?.full_name}</p>
                    <p className="text-muted text-xs">{b.user?.phone}</p>
                  </td>
                  <td className="py-4 pr-4 text-muted text-sm">{b.car?.name}</td>
                  <td className="py-4 pr-4 text-muted text-xs whitespace-nowrap">
                    {formatDate(b.start_date)} → {formatDate(b.end_date)}
                  </td>
                  <td className="py-4 pr-4 text-white font-bold text-sm">{formatCurrency(b.total_price || 0)}</td>
                  <td className="py-4 pr-4"><Badge status={b.status} /></td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {b.status === "pending" && (
                        <>
                          <form action={`/api/bookings/${b.id}/approve`} method="POST">
                            <button className="bg-green-500/10 text-green-400 border border-green-500/30 text-xs px-3 py-1 rounded-lg hover:bg-green-500/20">
                              Approve
                            </button>
                          </form>
                          <form action={`/api/bookings/${b.id}/reject`} method="POST">
                            <button className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-3 py-1 rounded-lg hover:bg-red-500/20">
                              Reject
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
