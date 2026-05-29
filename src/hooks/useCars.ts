"use client";
import { useEffect, useState, useCallback } from "react";
import { getCars } from "@/services/cars";
import type { Car } from "@/types";

interface Filters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: string;
}

export function useCars(filters?: Filters) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCars(filters);
      setCars(data);
    } catch (e) {
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { cars, loading, error, refetch: fetch };
}
