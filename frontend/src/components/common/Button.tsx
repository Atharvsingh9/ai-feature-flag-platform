import { memo } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-600 shadow-softer",
  secondary: "bg-white text-ink-900 border border-ink-300/50 hover:bg-surface-bg",
  ghost: "bg-transparent text-ink-700 hover:bg-black/[0.04]",
  danger: "bg-error text-white hover:bg-red-600 shadow-softer",
};

const sizes = { sm: "text-xs px-3 py-1.5 gap-1.5", md: "text-sm px-4 py-2.5 gap-2" };

export const Button = memo(function Button({
  variant = "primary", size = "md", icon, className, children, ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-xl2 font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});
