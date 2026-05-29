import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs text-muted uppercase tracking-widest font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-[#0D0D0D] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold/60 transition-colors",
          error && "border-red-500/50 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
