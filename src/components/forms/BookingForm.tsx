"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, parseISO } from "date-fns";
import { bookingSchema, type BookingFormValues } from "@/lib/validations/booking";
import { createBooking } from "@/services/bookings";
import { checkAvailability } from "@/services/availability";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Loader2, CreditCard } from "lucide-react";
import type { Car } from "@/types";

interface BookingFormProps {
  car: Car;
}

export default function BookingForm({ car }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { car_id: car.id },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const days =
    startDate && endDate
      ? Math.max(0, differenceInDays(parseISO(endDate), parseISO(startDate)))
      : 0;
  const total = days * (car.daily_price || 0);

  const onSubmit = async (values: BookingFormValues) => {
    setError(null);
    try {
      const available = await checkAvailability(car.id, values.start_date, values.end_date);
      if (!available) {
        setError("This vehicle is not available for the selected dates.");
        return;
      }

      const booking = await createBooking({ ...values, total_price: total });
      setBookingId(booking.id);

      // Get current user details for email
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("users").select("full_name").eq("id", user!.id).single();

      // Send notification emails
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_submitted",
          customerEmail: user!.email,
          customerName: profile?.full_name || "Customer",
          carName: car.name,
          startDate: values.start_date,
          endDate: values.end_date,
          total,
        }),
      });

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Failed to submit booking. Please try again.");
    }
  };

  const handleDeposit = async () => {
    if (!bookingId) return;
    setDepositLoading(true);
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          carName: car.name,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Payment setup failed.");
      }
    } catch (e) {
      setError("Payment failed. Please try again.");
    } finally {
      setDepositLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-green-400 text-2xl">✓</span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Request Submitted!</h3>
        <p className="text-[#71717A] text-sm leading-relaxed mb-6">
          Your booking request for the {car.name} has been received.
          We&apos;ll review it and contact you shortly.
        </p>

        {/* Deposit payment section */}
        <div className="bg-[#D4AF37]/8 border border-[rgba(212,175,55,0.25)] rounded-xl p-5 mb-4 text-left">
          <p className="text-[#D4AF37] font-bold text-sm mb-1">Security Deposit Required</p>
          <p className="text-[#71717A] text-xs leading-relaxed mb-4">
            A refundable £100 security deposit is required to confirm your booking.
            This will be returned after the rental if no damage occurs.
          </p>
          <button
            onClick={handleDeposit}
            disabled={depositLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C6A55A] text-black font-bold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {depositLoading
              ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
              : <><CreditCard size={15} /> Pay £100 Deposit</>
            }
          </button>
          <p className="text-[#71717A] text-xs text-center mt-2">
            Secure payment via Stripe · Fully refundable
          </p>
        </div>

        <p className="text-[#71717A] text-xs">
          You can also pay the deposit later from your dashboard.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs mt-3">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register("car_id")} />
      <Input
        label="Start Date"
        type="date"
        min={new Date().toISOString().split("T")[0]}
        error={errors.start_date?.message}
        {...register("start_date")}
      />
      <Input
        label="End Date"
        type="date"
        min={startDate || new Date().toISOString().split("T")[0]}
        error={errors.end_date?.message}
        {...register("end_date")}
      />

      {days > 0 && (
        <div className="bg-[#D4AF37]/5 border border-[rgba(212,175,55,0.2)] rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#71717A]">{formatCurrency(car.daily_price || 0)} × {days} days</span>
            <span className="text-white">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#71717A]">Security deposit</span>
            <span className="text-white">£100 (refundable)</span>
          </div>
          <div className="border-t border-[#1F1F1F] my-2" />
          <div className="flex justify-between">
            <span className="text-[#D4AF37] font-semibold text-sm">Total Rental</span>
            <span className="text-[#D4AF37] font-extrabold font-serif text-lg">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#71717A] uppercase tracking-widest font-medium">
          Notes (optional)
        </label>
        <textarea
          {...register("notes")}
          className="w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]/60 resize-none h-20 transition-colors"
          placeholder="Delivery address, special requests..."
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} disabled={days === 0}>
        {days > 0
          ? `Request Booking · ${formatCurrency(total)}`
          : "Select Dates to Continue"}
      </Button>
      <p className="text-xs text-[#71717A] text-center">
        £100 refundable deposit required · No card needed now
      </p>
    </form>
  );
}
