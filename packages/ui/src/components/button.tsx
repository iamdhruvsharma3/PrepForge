import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cx } from "@prepforge/utils";

const variantClasses = {
  primary:
    "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-200",
  secondary:
    "border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10",
} as const;

const sizeClasses = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: keyof typeof sizeClasses;
    variant?: keyof typeof variantClasses;
  }
>;

export function Button({
  children,
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

