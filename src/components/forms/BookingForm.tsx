"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, parseISO } from "date-fns";
import { bookingSchema, type BookingFormValues } from "@/lib/validations/booking";
import { createBooking } from "@/services/bookings";
import { checkAvailability } from "@/services/availability";
import { formatCurrency } from "@/lib/utils/format";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Car } from "@/types";

interface BookingFormProps {
  car: Car;
}

export default function BookingForm({ car }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("This vehicle is not available for the selected dates. Please choose different dates.");
        return;
      }
      await createBooking({ ...values, total_price: total });
      setSubmitted(true);
    } catch (e) {
      setError("Failed to submit booking. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-green-400 font-bold text-lg mb-2">Request Submitted!</h3>
        <p className="text-muted text-sm leading-relaxed">
          Your booking request for the {car.name} has been received. Our team
          will contact you shortly to confirm.
        </p>
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
        <div className="bg-gold/5 border border-[rgba(212,175,55,0.2)] rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">{formatCurrency(car.daily_price || 0)} × {days} days</span>
            <span className="text-white">{formatCurrency(total)}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between">
            <span className="text-gold font-semibold text-sm">Total Estimate</span>
            <span className="text-gold font-extrabold font-serif text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted uppercase tracking-widest font-medium">Notes (optional)</label>
        <textarea
          {...register("notes")}
          className="w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold/60 resize-none h-20 transition-colors"
          placeholder="Delivery address, special requests..."
        />
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" loading={isSubmitting} disabled={days === 0}>
        {days > 0 ? `Request Booking · ${formatCurrency(total)}` : "Select Dates to Continue"}
      </Button>
      <p className="text-xs text-muted text-center">
        ● Free cancellation · No payment required now
      </p>
    </form>
  );
}
