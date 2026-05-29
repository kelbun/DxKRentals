"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  user: { full_name: string; phone: string };
  car: { name: string; brand: string; model: string };
}

interface BlockedDate {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  car: { name: string };
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [bRes, blRes] = await Promise.all([
        supabase.from("bookings")
          .select("*, user:users(full_name, phone), car:cars(name, brand, model)")
          .in("status", ["pending", "approved", "active"])
          .order("start_date"),
        supabase.from("blocked_dates")
          .select("*, car:cars(name)")
          .order("start_date"),
      ]);
      setBookings(bRes.data || []);
      setBlocked(blRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startPadding = startOfMonth(currentMonth).getDay();
  const paddingDays = startPadding === 0 ? 6 : startPadding - 1;

  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => {
      const start = parseISO(b.start_date);
      const end = parseISO(b.end_date);
      return isWithinInterval(day, { start, end });
    });

  const getBlockedForDay = (day: Date) =>
    blocked.filter((b) => {
      const start = parseISO(b.start_date);
      const end = parseISO(b.end_date);
      return isWithinInterval(day, { start, end });
    });

  const selectedBookings = selectedDay ? getBookingsForDay(selectedDay) : [];
  const selectedBlocked = selectedDay ? getBlockedForDay(selectedDay) : [];

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500",
    approved: "bg-blue-500",
    active: "bg-green-500",
  };

  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif font-bold text-3xl text-white">Booking Calendar</h1>
          <p className="text-[#71717A] text-sm mt-1">View all bookings and blocked dates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              view === "calendar"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black"
                : "bg-[#161616] text-[#71717A] border border-[#1F1F1F]"
            }`}
          >Calendar</button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              view === "list"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black"
                : "bg-[#161616] text-[#71717A] border border-[#1F1F1F]"
            }`}
          >List</button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
            {/* Month nav */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-[#1F1F1F] rounded-lg transition-colors text-[#71717A] hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-white font-serif font-bold text-xl">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-[#1F1F1F] rounded-lg transition-colors text-[#71717A] hover:text-white">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs text-[#71717A] font-semibold uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((day) => {
                const dayBookings = getBookingsForDay(day);
                const dayBlocked = getBlockedForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());
                const hasActivity = dayBookings.length > 0 || dayBlocked.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSameDay(day, selectedDay!) ? null : day)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 transition-all ${
                      isSelected
                        ? "bg-[#D4AF37]/20 border border-[#D4AF37]/50"
                        : isToday
                        ? "bg-[#1F1F1F] border border-[#D4AF37]/30"
                        : "hover:bg-[#1F1F1F] border border-transparent"
                    }`}
                  >
                    <span className={`text-xs font-semibold mt-0.5 ${
                      isSelected ? "text-[#D4AF37]" : isToday ? "text-[#D4AF37]" : "text-white"
                    }`}>
                      {format(day, "d")}
                    </span>
                    {hasActivity && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayBookings.slice(0, 2).map((b) => (
                          <span key={b.id} className={`w-1.5 h-1.5 rounded-full ${statusColor[b.status] || "bg-gray-500"}`} />
                        ))}
                        {dayBlocked.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-[#1F1F1F]">
              {[
                { color: "bg-yellow-500", label: "Pending" },
                { color: "bg-blue-500", label: "Approved" },
                { color: "bg-green-500", label: "Active" },
                { color: "bg-red-500", label: "Blocked" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[#71717A] text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
            {selectedDay ? (
              <>
                <h3 className="text-white font-bold text-base mb-4">
                  {format(selectedDay, "EEEE, d MMMM yyyy")}
                </h3>
                {selectedBookings.length === 0 && selectedBlocked.length === 0 ? (
                  <p className="text-[#71717A] text-sm">No activity on this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedBookings.map((b) => (
                      <div key={b.id} className="bg-[#101010] border border-[#1F1F1F] rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-semibold text-sm">{b.car?.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            b.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                            b.status === "approved" ? "bg-blue-500/15 text-blue-400" :
                            "bg-green-500/15 text-green-400"
                          }`}>{b.status}</span>
                        </div>
                        <p className="text-[#71717A] text-xs">{b.user?.full_name}</p>
                        <p className="text-[#71717A] text-xs">{b.user?.phone}</p>
                        <p className="text-[#D4AF37] text-xs font-bold mt-2">
                          £{b.total_price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {selectedBlocked.map((b) => (
                      <div key={b.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-red-400 font-semibold text-sm">Blocked</p>
                        <p className="text-[#71717A] text-xs mt-1">{b.car?.name}</p>
                        {b.reason && <p className="text-[#71717A] text-xs">{b.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#71717A] text-sm">Click a day to see bookings</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="bg-[#161616] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
          <h2 className="text-white font-semibold text-base mb-5">Upcoming Bookings</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-[#101010] rounded-xl animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-[#71717A] text-sm text-center py-10">No upcoming bookings.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-[#101010] border border-[#1F1F1F] rounded-xl">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{b.car?.name}</p>
                    <p className="text-[#71717A] text-xs mt-0.5">{b.user?.full_name} · {b.user?.phone}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-white text-xs font-semibold">
                      {format(parseISO(b.start_date), "dd MMM")} → {format(parseISO(b.end_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[#D4AF37] font-bold text-sm">£{b.total_price?.toLocaleString()}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                      b.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      b.status === "approved" ? "bg-blue-500/15 text-blue-400" :
                      "bg-green-500/15 text-green-400"
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
