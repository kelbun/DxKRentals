import { cn } from "@/lib/utils/cn";
import type { BookingStatus } from "@/types";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  active: "bg-green-500/10 text-green-400 border-green-500/30",
  completed: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export default function Badge({ status }: { status: BookingStatus | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide",
        statusStyles[status] || statusStyles.cancelled
      )}
    >
      {status}
    </span>
  );
}
