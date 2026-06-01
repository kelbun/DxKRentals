"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  differenceInDays, parseISO, format, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval,
  isBefore, startOfDay, isAfter
} from "date-fns";
import { bookingSchema, type BookingFormValues } from "@/lib/validations/booking";
import { createBooking } from "@/services/bookings";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import {
  Loader2, CreditCard, Upload, X, FileCheck,
  ChevronRight, ChevronLeft, AlertCircle
} from "lucide-react";
import type { Car } from "@/types";

interface BookingFormProps {
  car: Car;
}

type Step = "dates" | "documents" | "confirm" | "submitted";

interface UnavailableRange {
  start: string;
  end: string;
  type: "booking" | "blocked";
}

export default function BookingForm({ car }: BookingFormProps) {
  const [step, setStep] = useState<Step>("dates");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [unavailable, setUnavailable] = useState<UnavailableRange[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  // Document state
  const [licenceFront, setLicenceFront] = useState<File | null>(null);
  const [licenceBack, setLicenceBack] = useState<File | null>(null);
  const [licenceFrontPreview, setLicenceFrontPreview] = useState<string | null>(null);
  const [licenceBackPreview, setLicenceBackPreview] = useState<string | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const today = startOfDay(new Date());

  // Load unavailable dates for this car
  useEffect(() => {
    const load = async () => {
      setLoadingDates(true);
      const [bookingsRes, blockedRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("start_date, end_date")
          .eq("car_id", car.id)
          .in("status", ["approved", "active", "pending"]),
        supabase
          .from("blocked_dates")
          .select("start_date, end_date")
          .eq("car_id", car.id),
      ]);

      const ranges: UnavailableRange[] = [
        ...(bookingsRes.data || []).map((b: any) => ({
          start: b.start_date,
          end: b.end_date,
          type: "booking" as const,
        })),
        ...(blockedRes.data || []).map((b: any) => ({
          start: b.start_date,
          end: b.end_date,
          type: "blocked" as const,
        })),
      ];
      setUnavailable(ranges);
      setLoadingDates(false);
    };
    load();
  }, [car.id]);

  const isDayUnavailable = (day: Date): boolean => {
    if (isBefore(day, today)) return true;
    return unavailable.some((r) =>
      isWithinInterval(day, {
        start: startOfDay(parseISO(r.start)),
        end: startOfDay(parseISO(r.end)),
      })
    );
  };

  const isDayInRange = (day: Date): boolean => {
    if (!startDate || !endDate) return false;
    return isWithinInterval(day, { start: startDate, end: endDate });
  };

  const isRangeClean = (start: Date, end: Date): boolean => {
    const days = eachDayOfInterval({ start, end });
    return !days.some((d) => isDayUnavailable(d));
  };

  const handleDayClick = (day: Date) => {
    if (isDayUnavailable(day)) return;

    if (!startDate || (startDate && endDate)) {
      // Start fresh selection
      setStartDate(day);
      setEndDate(null);
      setSelectingEnd(true);
      setError(null);
    } else if (selectingEnd) {
      if (isBefore(day, startDate)) {
        setStartDate(day);
        setEndDate(null);
        return;
      }
      if (!isRangeClean(startDate, day)) {
        setError("Your selected range includes unavailable dates. Please choose different dates.");
        return;
      }
      setEndDate(day);
      setSelectingEnd(false);
      setError(null);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const paddingDays = (() => {
    const d = startOfMonth(currentMonth).getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const rentalDays = startDate && endDate
    ? Math.max(0, differenceInDays(endDate, startDate))
    : 0;
  const total = rentalDays * (car.daily_price || 0);

  const { register, getValues } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { car_id: car.id },
  });

  const handleFileSelect = (
    file: File,
    setter: (f: File) => void,
    previewSetter: (s: string) => void
  ) => {
    setter(file);
    const reader = new FileReader();
    reader.onload = (e) => previewSetter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadDocuments = async (userId: string) => {
    const uploads = [];
    if (licenceFront) uploads.push({ file: licenceFront, type: "licence_front" });
    if (licenceBack) uploads.push({ file: licenceBack, type: "licence_back" });

    for (const { file, type } of uploads) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${type}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("driver-documents")
        .upload(path, file, { upsert: true });
      if (uploadErr) continue;
      const { data: urlData } = supabase.storage
        .from("driver-documents").getPublicUrl(path);
      await supabase.from("driver_documents").insert({
        user_id: userId,
        document_url: urlData.publicUrl,
        document_type: type,
        approved: false,
      });
    }
  };

  const onDatesNext = () => {
    if (!startDate || !endDate || rentalDays === 0) {
      setError("Please select a start and end date.");
      return;
    }
    setError(null);
    setStep("documents");
  };

  const onDocsNext = () => {
    if (!licenceFront) {
      setError("Please upload the front of your driving licence.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const onSubmit = async () => {
    if (!startDate || !endDate) return;
    setUploadingDocs(true);
    setError(null);
    try {
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      // Double-check availability before submitting
      const { data: conflicts } = await supabase
        .from("bookings")
        .select("id")
        .eq("car_id", car.id)
        .in("status", ["approved", "active", "pending"])
        .lte("start_date", endStr)
        .gte("end_date", startStr);

      if (conflicts && conflicts.length > 0) {
        setError("Sorry — these dates were just taken. Please select new dates.");
        setStep("dates");
        setUploadingDocs(false);
        return;
      }

      const booking = await createBooking({
        car_id: car.id,
        start_date: startStr,
        end_date: endStr,
        total_price: total,
        notes: getValues("notes"),
      });
      setBookingId(booking.id);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await uploadDocuments(user.id);
        const { data: profile } = await supabase
          .from("users").select("full_name").eq("id", user.id).single();
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "booking_submitted",
            customerEmail: user.email,
            customerName: profile?.full_name || "Customer",
            carName: car.name,
            startDate: startStr,
            endDate: endStr,
            total,
          }),
        });
      }
      setStep("submitted");
    } catch (e: any) {
      setError(e.message || "Failed to submit. Please try again.");
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleDeposit = async () => {
    if (!bookingId || !startDate || !endDate) return;
    setDepositLoading(true);
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          carName: car.name,
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Payment failed.");
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setDepositLoading(false);
    }
  };

  const steps = ["Dates", "Documents", "Confirm"];
  const stepIndex = step === "dates" ? 0 : step === "documents" ? 1 : step === "confirm" ? 2 : 3;
  const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // ── SUBMITTED ──────────────────────────────────────────
  if (step === "submitted") {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-green-400 text-2xl">✓</span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Request Submitted!</h3>
        <p className="text-[#71717A] text-sm leading-relaxed mb-6">
          Your booking request and documents have been received. We&apos;ll review everything and contact you shortly.
        </p>
        <div className="bg-[#D4AF37]/8 border border-[rgba(212,175,55,0.25)] rounded-xl p-5 text-left">
          <p className="text-[#D4AF37] font-bold text-sm mb-1">Security Deposit Required</p>
          <p className="text-[#71717A] text-xs leading-relaxed mb-4">
            A refundable £100 deposit is required to confirm your booking. Returned in full after the rental.
          </p>
          <button
            onClick={handleDeposit}
            disabled={depositLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60"
          >
            {depositLoading
              ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
              : <><CreditCard size={15} /> Pay £100 Deposit</>}
          </button>
          <p className="text-[#71717A] text-xs text-center mt-2">Secure payment via Stripe · Fully refundable</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs mt-3">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${
              i === stepIndex ? "text-[#D4AF37]" : i < stepIndex ? "text-green-400" : "text-[#71717A]"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                i === stepIndex ? "border-[#D4AF37] bg-[#D4AF37]/15" :
                i < stepIndex ? "border-green-500 bg-green-500/15 text-green-400" :
                "border-[#1F1F1F] text-[#71717A]"
              }`}>
                {i < stepIndex ? "✓" : i + 1}
              </div>
              {s}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-5 ${i < stepIndex ? "bg-green-500/40" : "bg-[#1F1F1F]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1 — Calendar date picker ── */}
      {step === "dates" && (
        <div className="space-y-4">
          {loadingDates ? (
            <div className="h-64 bg-[#101010] rounded-xl animate-pulse flex items-center justify-center">
              <Loader2 size={20} className="text-[#71717A] animate-spin" />
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { color: "bg-[#D4AF37]/80", label: "Selected" },
                  { color: "bg-red-500/60", label: "Booked" },
                  { color: "bg-orange-500/60", label: "Blocked" },
                  { color: "bg-[#1F1F1F]", label: "Past" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-[#71717A] text-xs">{label}</span>
                  </div>
                ))}
              </div>

              {/* Calendar */}
              <div className="bg-[#101010] border border-[#1F1F1F] rounded-xl p-4">
                {/* Month nav */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-[#1F1F1F] rounded-lg text-[#71717A] hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-white font-semibold text-sm">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-[#1F1F1F] rounded-lg text-[#71717A] hover:text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-[10px] text-[#71717A] font-semibold py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`p-${i}`} />
                  ))}
                  {days.map((day) => {
                    const unavailableDay = isDayUnavailable(day);
                    const isStart = startDate && isSameDay(day, startDate);
                    const isEnd = endDate && isSameDay(day, endDate);
                    const inRange = isDayInRange(day);
                    const isPast = isBefore(day, today);

                    // Find type of unavailability
                    const blockedInfo = unavailable.find(
                      (r) =>
                        isWithinInterval(day, {
                          start: startOfDay(parseISO(r.start)),
                          end: startOfDay(parseISO(r.end)),
                        })
                    );

                    let bgClass = "hover:bg-[#1F1F1F] cursor-pointer";
                    let textClass = "text-white";

                    if (isPast) {
                      bgClass = "cursor-not-allowed";
                      textClass = "text-[#3f3f46]";
                    } else if (unavailableDay && blockedInfo?.type === "booking") {
                      bgClass = "bg-red-500/20 cursor-not-allowed";
                      textClass = "text-red-400/60";
                    } else if (unavailableDay && blockedInfo?.type === "blocked") {
                      bgClass = "bg-orange-500/20 cursor-not-allowed";
                      textClass = "text-orange-400/60";
                    } else if (isStart || isEnd) {
                      bgClass = "bg-[#D4AF37] cursor-pointer";
                      textClass = "text-black font-bold";
                    } else if (inRange) {
                      bgClass = "bg-[#D4AF37]/20 cursor-pointer";
                      textClass = "text-[#D4AF37]";
                    }

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        disabled={unavailableDay}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${bgClass} ${textClass}`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection status */}
              <div className="bg-[#161616] border border-[#1F1F1F] rounded-xl p-3">
                {!startDate ? (
                  <p className="text-[#71717A] text-xs text-center">Click a date to start your selection</p>
                ) : !endDate ? (
                  <p className="text-[#D4AF37] text-xs text-center">
                    Start: {format(startDate, "dd MMM yyyy")} — Now click your end date
                  </p>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white text-xs font-semibold">
                        {format(startDate, "dd MMM")} → {format(endDate, "dd MMM yyyy")}
                      </p>
                      <p className="text-[#71717A] text-xs mt-0.5">{rentalDays} day{rentalDays !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D4AF37] font-bold font-serif">{formatCurrency(total)}</p>
                      <p className="text-[#71717A] text-xs">+ £100 deposit</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#71717A] uppercase tracking-widest font-medium block">
                  Notes (optional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Delivery address, special requests..."
                  className="w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]/60 resize-none transition-colors"
                />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={onDatesNext}
            disabled={!startDate || !endDate || rentalDays === 0}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold py-3 rounded-full text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Continue <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── STEP 2 — Documents ── */}
      {step === "documents" && (
        <div className="space-y-4">
          <div>
            <p className="text-white font-semibold text-sm mb-1">Upload Driving Licence</p>
            <p className="text-[#71717A] text-xs mb-4 leading-relaxed">
              We need both sides of your valid UK or international driving licence.
              Stored securely — only visible to DxK Rentals staff.
            </p>
          </div>

          {/* Front */}
          <div>
            <label className="text-xs text-[#71717A] uppercase tracking-wider font-medium block mb-2">
              Front of Licence *
            </label>
            {licenceFrontPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[rgba(212,175,55,0.3)]">
                <img src={licenceFrontPreview} alt="Front" className="w-full h-32 object-cover" />
                <button
                  onClick={() => { setLicenceFront(null); setLicenceFrontPreview(null); }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-500/80"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full">
                  <FileCheck size={11} className="text-green-400" />
                  <span className="text-green-400 text-xs">Uploaded</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => frontRef.current?.click()}
                className="w-full border-2 border-dashed border-[rgba(212,175,55,0.25)] rounded-xl py-6 flex flex-col items-center gap-2 hover:border-[rgba(212,175,55,0.5)] transition-colors"
              >
                <Upload size={18} className="text-[#D4AF37]" />
                <span className="text-[#71717A] text-xs">Click to upload front</span>
              </button>
            )}
            <input ref={frontRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, setLicenceFront, setLicenceFrontPreview); }} />
          </div>

          {/* Back */}
          <div>
            <label className="text-xs text-[#71717A] uppercase tracking-wider font-medium block mb-2">
              Back of Licence (recommended)
            </label>
            {licenceBackPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[rgba(212,175,55,0.3)]">
                <img src={licenceBackPreview} alt="Back" className="w-full h-32 object-cover" />
                <button
                  onClick={() => { setLicenceBack(null); setLicenceBackPreview(null); }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-500/80"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full">
                  <FileCheck size={11} className="text-green-400" />
                  <span className="text-green-400 text-xs">Uploaded</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => backRef.current?.click()}
                className="w-full border-2 border-dashed border-[rgba(212,175,55,0.2)] rounded-xl py-6 flex flex-col items-center gap-2 hover:border-[rgba(212,175,55,0.4)] transition-colors"
              >
                <Upload size={18} className="text-[#71717A]" />
                <span className="text-[#71717A] text-xs">Click to upload back</span>
              </button>
            )}
            <input ref={backRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, setLicenceBack, setLicenceBackPreview); }} />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep("dates"); setError(null); }}
              className="flex-1 py-3 bg-[#101010] text-[#71717A] border border-[#1F1F1F] rounded-full text-sm hover:text-white transition-colors">
              Back
            </button>
            <button onClick={onDocsNext}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold py-3 rounded-full text-sm hover:opacity-90">
              Continue <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Confirm ── */}
      {step === "confirm" && startDate && endDate && (
        <div className="space-y-4">
          <p className="text-white font-semibold text-sm">Review Your Booking</p>
          <div className="bg-[#101010] border border-[#1F1F1F] rounded-xl divide-y divide-[#1F1F1F]">
            {[
              ["Vehicle", car.name],
              ["Start Date", format(startDate, "dd MMM yyyy")],
              ["End Date", format(endDate, "dd MMM yyyy")],
              ["Duration", `${rentalDays} day${rentalDays !== 1 ? "s" : ""}`],
              ["Rental Total", formatCurrency(total)],
              ["Security Deposit", "£100 refundable"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between p-3.5">
                <span className="text-[#71717A] text-xs uppercase tracking-wider">{label}</span>
                <span className={`text-sm font-semibold ${label === "Rental Total" ? "text-[#D4AF37] font-serif text-base" : "text-white"}`}>
                  {value}
                </span>
              </div>
            ))}
            <div className="flex justify-between p-3.5">
              <span className="text-[#71717A] text-xs uppercase tracking-wider">Documents</span>
              <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                <FileCheck size={12} />
                {licenceFront && licenceBack ? "Both sides uploaded" : "Front uploaded"}
              </span>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#1F1F1F] rounded-xl p-4">
            <p className="text-[#71717A] text-xs leading-relaxed">
              By submitting you confirm you hold a valid driving licence and agree to DxK Rentals{" "}
              <a href="/terms" className="text-[#D4AF37] hover:underline">terms and conditions</a>.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep("documents"); setError(null); }}
              className="flex-1 py-3 bg-[#101010] text-[#71717A] border border-[#1F1F1F] rounded-full text-sm hover:text-white transition-colors">
              Back
            </button>
            <button onClick={onSubmit} disabled={uploadingDocs}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold py-3 rounded-full text-sm hover:opacity-90 disabled:opacity-60">
              {uploadingDocs
                ? <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                : "Submit Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
