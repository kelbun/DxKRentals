import { format, differenceInDays, parseISO } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return format(parseISO(date), "dd MMM yyyy");
}

export function calcRentalDays(start: string, end: string): number {
  return Math.max(0, differenceInDays(parseISO(end), parseISO(start)));
}

export function calcTotalPrice(
  dailyPrice: number,
  weekendPrice: number,
  start: string,
  end: string
): number {
  const days = calcRentalDays(start, end);
  return days * dailyPrice;
}
