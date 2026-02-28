export const formatDate = (dateInput?: string | number | Date | null) => {
  if (!dateInput) return "Unknown date";
  const date = new Date(String(dateInput));
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const hazardTypeLabels = {
  tsunami: "Tsunami",
  storm_surge: "Storm Surge",
  high_waves: "High Waves",
  swell_surge: "Swell Surge",
  coastal_current: "Coastal Current",
  flooding: "Coastal Flooding",
  coastal_damage: "Coastal Damage",
  other: "Other",
};

export const severityColors = {
  low: "text-green-700 bg-green-50 border-green-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200",
};
