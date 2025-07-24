import colors from "./colors";

export const lightTheme = {
  colors: {
    primary: "#667eea",
    primaryVariant: "#764ba2",
    secondary: "#f093fb",
    secondaryVariant: "#f5576c",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    error: "#EF4444",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#1E293B",
    onSurface: "#1E293B",
    onError: "#FFFFFF",
    text: "#1E293B",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    card: "#FFFFFF",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
    accent: "#8B5CF6",
    muted: "#F1F5F9",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export const darkTheme = {
  colors: {
    primary: "#8B5CF6",
    primaryVariant: "#7C3AED",
    secondary: "#EC4899",
    secondaryVariant: "#DB2777",
    background: "#0F172A",
    surface: "#1E293B",
    error: "#F87171",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#F8FAFC",
    onSurface: "#F8FAFC",
    onError: "#FFFFFF",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    border: "#334155",
    card: "#1E293B",
    success: "#34D399",
    warning: "#FBBF24",
    info: "#60A5FA",
    accent: "#A78BFA",
    muted: "#334155",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export type Theme = typeof lightTheme;

export const COLORS = {
  primary: "#8B5CF6", // tím vừa
  primaryLight: "#E9D5FF",
  secondary: "#7C3AED",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  textSecondary: "#64748B",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E42",
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const SIZES = {
  radius: 16,
  padding: 20,
  cardPadding: 16,
  icon: 24,
};

export const SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};
