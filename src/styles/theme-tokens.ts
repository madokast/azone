/**
 * Typed accessors for app semantic CSS variables.
 * Use these constants in TS/TSX instead of hardcoding `var(--...)` strings.
 */
export const appColor = {
  bg: "var(--app-color-bg)",
  text: "var(--app-color-text)",
  border: "var(--app-color-border)",
  surface: "var(--app-color-surface)",
} as const;
