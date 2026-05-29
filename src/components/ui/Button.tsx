import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-gradient-to-r from-gold to-goldSoft text-black hover:opacity-90 shadow-lg shadow-gold/20",
      secondary: "bg-surface2 text-white border border-[rgba(212,175,55,0.2)] hover:border-gold/50",
      ghost: "bg-transparent text-muted hover:text-white border border-border hover:border-zinc-600",
      danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
    };
    const sizes = {
      sm: "text-xs px-4 py-2",
      md: "text-sm px-6 py-2.5",
      lg: "text-base px-8 py-3.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
