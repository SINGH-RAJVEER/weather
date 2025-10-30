import { HazardReport } from "../types/types";

const API_URL = "http://localhost:3000/api/hazard-reports";

// Normalize backend MongoDB document to frontend HazardReport shape
const mapHazardReport = (r: any): HazardReport => {
  return {
    id: String(r.id ?? r._id ?? ""),
    userId: String(r.userId ?? ""),
    userName: String(r.userName ?? ""),
    type: r.type,
    severity: r.severity,
    description: String(r.description ?? ""),
    location: {
      lat: Number(r.location?.lat ?? 0),
      lng: Number(r.location?.lng ?? 0),
      address: String(r.location?.address ?? ""),
    },
    timestamp:
      typeof r.timestamp === "string"
        ? r.timestamp
        : new Date(r.timestamp ?? Date.now()).toISOString(),
    media: Array.isArray(r.media) ? (r.media as string[]) : [],
    verified: Boolean(r.verified),
    likes: Number(r.likes ?? 0),
    comments: Number(r.comments ?? 0),
  };
};

export const addHazardReport = async (
  report: Omit<
    HazardReport,
    "id" | "timestamp" | "likes" | "comments" | "verified" | "media"
  >,
  mediaFiles: File[]
): Promise<HazardReport> => {
  const formData = new FormData();
  formData.append("report", JSON.stringify(report));
  mediaFiles.forEach((file) => {
    formData.append("media", file);
  });

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to add hazard report");
  }

  const data = await response.json();
  return mapHazardReport(data);
};

export const getHazardReports = async (): Promise<HazardReport[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch hazard reports");
  }
  const data = await response.json();
  // Some backends may wrap the array; ensure we handle both array and object
  const list = Array.isArray(data) ? data : data?.items ?? [];
  return list.map(mapHazardReport);
};
