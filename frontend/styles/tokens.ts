// Design tokens for GreenFlow — central source of truth for colors, spacing, and typography
export const colors = {
  background: "#03110F",
  backgroundAlt: "#061713",
  panel: "#0A211B",
  panelAlt: "#0E2922",
  primary: "#19D27C",
  primaryAlt: "#35E68D",
  teal: "#238F7C",
  text: "#F1F5F2",
  textSecondary: "#A6B3AD",
  muted: "#6D7E76",
  warning: "#D7A93E",
  critical: "#E95B5B",
  success: "#31D77B",
};

export const typography = {
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  headingWeight: 800,
  bodyWeight: 500,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const tokens = { colors, typography, spacing };
export default tokens;
