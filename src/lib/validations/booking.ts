import { z } from "zod";

export const bookingSchema = z
  .object({
    car_id: z.string().uuid("Invalid car ID"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    notes: z.string().optional(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;
