export type UserRole = "customer" | "admin" | "partner";

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "completed"
  | "cancelled";

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  phone: string | null;
  created_at: string;
}

export interface Partner {
  id: string;
  user_id: string;
  business_name: string | null;
  created_at: string;
}

export interface Car {
  id: string;
  partner_id: string | null;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  description: string | null;
  daily_price: number | null;
  weekend_price: number | null;
  transmission: string | null;
  fuel_type: string | null;
  seats: number | null;
  color: string | null;
  mileage: number | null;
  featured: boolean;
  status: string;
  created_at: string;
  car_images?: CarImage[];
}

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  sort_order: number;
}

export interface Booking {
  id: string;
  user_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number | null;
  status: BookingStatus;
  payment_status: string;
  payment_notes: string | null;
  notes: string | null;
  created_at: string;
  car?: Car;
  user?: User;
}

export interface BlockedDate {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface DriverDocument {
  id: string;
  user_id: string;
  document_url: string;
  document_type: string;
  approved: boolean;
  uploaded_at: string;
}

export interface RevenueLog {
  id: string;
  booking_id: string;
  amount: number;
  partner_amount: number;
  platform_amount: number;
  created_at: string;
}
