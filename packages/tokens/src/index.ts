export const tokens = {
  colors: {
    canvas: "#0b1020",
    panel: "#141b34",
    panelMuted: "#1c2647",
    border: "#31406f",
    accent: "#5fd1ff",
    accentWarm: "#ffb15f",
    text: "#f2f5ff",
    textMuted: "#b7c2e1",
    success: "#4fd4a4",
  },
  motion: {
    slow: "240ms",
    standard: "180ms",
  },
  radii: {
    lg: "24px",
    md: "16px",
    sm: "10px",
  },
  spacing: {
    lg: "32px",
    md: "20px",
    sm: "12px",
    xs: "8px",
  },
} as const;

export const webThemeVariables = {
  "--pf-color-accent": tokens.colors.accent,
  "--pf-color-accent-warm": tokens.colors.accentWarm,
  "--pf-color-border": tokens.colors.border,
  "--pf-color-canvas": tokens.colors.canvas,
  "--pf-color-panel": tokens.colors.panel,
  "--pf-color-panel-muted": tokens.colors.panelMuted,
  "--pf-color-success": tokens.colors.success,
  "--pf-color-text": tokens.colors.text,
  "--pf-color-text-muted": tokens.colors.textMuted,
  "--pf-radius-lg": tokens.radii.lg,
  "--pf-radius-md": tokens.radii.md,
  "--pf-radius-sm": tokens.radii.sm,
} as const;

