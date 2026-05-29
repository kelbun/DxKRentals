import { z } from "zod";

export const carSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(2000).max(2030).optional(),
  description: z.string().optional(),
  daily_price: z.number().positive("Price must be positive"),
  weekend_price: z.number().positive("Price must be positive").optional(),
  transmission: z.string().optional(),
  fuel_type: z.string().optional(),
  seats: z.number().int().min(1).max(10).optional(),
  color: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["available", "unavailable", "maintenance"]).default("available"),
});

export type CarFormValues = z.infer<typeof carSchema>;
