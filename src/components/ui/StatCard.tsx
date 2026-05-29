import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export default function StatCard({ label, value, subtext, icon, accentColor = "#D4AF37" }: StatCardProps) {
  return (
    <div className="bg-surface2 border border-[rgba(212,175,55,0.15)] rounded-2xl p-6 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-50"
        style={{ background: `radial-gradient(circle at 80% 20%, ${accentColor}20, transparent 70%)` }}
      />
      {icon && <div className="text-2xl mb-3" style={{ color: accentColor }}>{icon}</div>}
      <div className="font-serif font-bold text-3xl text-white mb-1">{value}</div>
      <div className="text-muted text-xs uppercase tracking-widest">{label}</div>
      {subtext && (
        <div className="text-xs font-semibold mt-2" style={{ color: accentColor }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
