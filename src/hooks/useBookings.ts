"use client";
import { useEffect, useState, useCallback } from "react";
import { getMyBookings } from "@/services/bookings";
import type { Booking } from "@/types";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
    } catch (e) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { bookings, loading, error, refetch: fetch };
}
