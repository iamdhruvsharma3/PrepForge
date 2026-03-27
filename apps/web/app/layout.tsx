import type { CSSProperties, ReactNode } from "react";

import { webThemeVariables } from "@prepforge/tokens";

import "./globals.css";

export const metadata = {
  description: "PrepForge foundation workspace",
  title: "PrepForge",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={webThemeVariables as CSSProperties}>
      <body>{children}</body>
    </html>
  );
}

