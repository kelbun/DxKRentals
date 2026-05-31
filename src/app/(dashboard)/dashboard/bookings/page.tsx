"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  notes: string;
  payment_notes: string;
  created_at: string;
  car: { name: string; brand: string };
  user: { full_name: string; email: string; phone: string };
}

const STATUS_TABS = ["all", "pending", "approved", "active", "completed", "rejected", "cancelled"];

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const supabase = createClient();

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, car:cars(name, brand), user:users(full_name, email, phone)")
      .order("created_at", { ascending: false });
    if (error) console.error("Fetch error:", error);
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    setUpdateError("");

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      setUpdateError(`Failed: ${error.message}`);
      setUpdating(false);
      return;
    }

    // Send email notification to customer
    if (selected && (status === "approved" || status === "rejected")) {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: status === "approved" ? "booking_approved" : "booking_rejected",
          customerEmail: selected.user?.email,
          customerName: selected.user?.full_name,
          carName: selected.car?.name,
          startDate: selected.start_date,
          endDate: selected.end_date,
          total: selected.total_price,
        }),
      });
    }

    await fetchBookings();
    setSelected((prev) => prev ? { ...prev, status } : null);
    setUpdating(false);
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts: Record<string, number> = {};
  STATUS_TABS.forEach((s) => {
    counts[s] = s === "all"
      ? bookings.length
      : bookings.filter((b) => b.status === s).length;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif font-bold text-3xl text-white">Booking Management</h1>
        <p className="text-[#71717A] text-sm mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
              filter === s
                ? "bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black"
                : "bg-[#161616] text-[#71717A] border border-[#1F1F1F] hover:text-white"
            }`}
          >
            {s}
            {counts[s] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                filter === s ? "bg-black/20 text-black" : "bg-[#1F1F1F] text-[#71717A]"
              }`}>{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings list */}
        <div className="lg:col-span-2 bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-16 bg-[#101010] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[#71717A] text-sm text-center py-10">No bookings found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setUpdateError("");
                    setSelected(selected?.id === b.id ? null : b);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                    selected?.id === b.id
                      ? "bg-[#D4AF37]/8 border-[rgba(212,175,55,0.3)]"
                      : "bg-[#101010] border-[#1F1F1F] hover:border-[#2F2F2F]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {b.car?.name || "Unknown car"}
                    </p>
                    <p className="text-[#71717A] text-xs mt-0.5">
                      {b.user?.full_name || "Unknown customer"}
                    </p>
                  </div>
                  <div className="text-center px-3 hidden md:block">
                    <p className="text-white text-xs">
                      {formatDate(b.start_date)} → {formatDate(b.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <p className="text-[#D4AF37] font-bold text-sm">
                      {formatCurrency(b.total_price || 0)}
                    </p>
                    <Badge status={b.status as any} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
          {selected ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-white font-bold text-base">Booking Details</h3>
                <button
                  onClick={() => { setSelected(null); setUpdateError(""); }}
                  className="text-[#71717A] hover:text-white text-xs"
                >Close</button>
              </div>

              <div className="space-y-3">
                <div className="bg-[#101010] rounded-xl p-4">
                  <p className="text-[#71717A] text-xs uppercase tracking-wider mb-1">Vehicle</p>
                  <p className="text-white font-semibold text-sm">{selected.car?.name}</p>
                </div>

                <div className="bg-[#101010] rounded-xl p-4">
                  <p className="text-[#71717A] text-xs uppercase tracking-wider mb-2">Customer</p>
                  <p className="text-white text-sm font-semibold">{selected.user?.full_name}</p>
                  <p className="text-[#71717A] text-xs mt-1">{selected.user?.email}</p>
                  <p className="text-[#71717A] text-xs">{selected.user?.phone}</p>
                </div>

                <div className="bg-[#101010] rounded-xl p-4">
                  <p className="text-[#71717A] text-xs uppercase tracking-wider mb-2">Rental Period</p>
                  <p className="text-white text-sm">{formatDate(selected.start_date)}</p>
                  <p className="text-[#71717A] text-xs my-1">to</p>
                  <p className="text-white text-sm">{formatDate(selected.end_date)}</p>
                </div>

                <div className="bg-[#101010] rounded-xl p-4 flex justify-between items-center">
                  <span className="text-[#71717A] text-xs uppercase tracking-wider">Total</span>
                  <span className="text-[#D4AF37] font-bold font-serif text-lg">
                    {formatCurrency(selected.total_price || 0)}
                  </span>
                </div>

                {selected.notes && (
                  <div className="bg-[#101010] rounded-xl p-4">
                    <p className="text-[#71717A] text-xs uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-white text-sm">{selected.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#71717A] text-xs">Current Status</span>
                  <Badge status={selected.status as any} />
                </div>

                {/* Error message */}
                {updateError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs">
                    {updateError}
                  </div>
                )}

                {/* Action buttons */}
                {selected.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => updateStatus(selected.id, "approved")}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 text-green-400 border border-green-500/30 py-3 rounded-xl text-sm font-semibold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, "rejected")}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 py-3 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {updating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>
                )}

                {selected.status === "approved" && (
                  <button
                    onClick={() => updateStatus(selected.id, "active")}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 py-3 rounded-xl text-sm font-semibold hover:bg-blue-500/20 disabled:opacity-50"
                  >
                    {updating && <Loader2 size={14} className="animate-spin" />}
                    Mark as Active
                  </button>
                )}

                {selected.status === "active" && (
                  <button
                    onClick={() => updateStatus(selected.id, "completed")}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-500/20 disabled:opacity-50"
                  >
                    {updating && <Loader2 size={14} className="animate-spin" />}
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye size={24} className="text-[#71717A] mx-auto mb-3" />
              <p className="text-[#71717A] text-sm">
                Click a booking to view details and take action
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
