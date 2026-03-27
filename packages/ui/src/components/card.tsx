import type { HTMLAttributes, PropsWithChildren } from "react";

import { cx } from "@prepforge/utils";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-[var(--pf-radius-md)] border border-white/10 bg-white/5 p-6 backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

