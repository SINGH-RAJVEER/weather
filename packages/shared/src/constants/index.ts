// Hazard type mapping
export const hazardTypeLabels: Record<string, string> = {
  tsunami: "Tsunami",
  storm_surge: "Storm Surge",
  high_waves: "High Waves",
  swell_surge: "Swell Surge",
  coastal_current: "Coastal Current",
  flooding: "Coastal Flooding",
  coastal_damage: "Coastal Damage",
  other: "Other",
};

// Severity colors (compatible with both web and mobile)
export const severityColors = {
  low: "text-green-700 bg-green-50 border-green-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200",
};

// Severity color mappings
export const severityColorMap = {
  low: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  medium: {
    text: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  high: {
    text: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  critical: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

// API base URL
export const API_BASE_URL = "http://localhost:3000/api";

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "incois_token",
  USER_DATA: "incois_user",
} as const;
