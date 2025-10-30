import { PublicAdvisory } from "../types/types";

const API_URL = "http://localhost:3000/api/advisories";

// Normalize backend MongoDB document to frontend PublicAdvisory shape
const mapPublicAdvisory = (a: any): PublicAdvisory => {
  return {
    id: String(a.id ?? a._id ?? ""),
    title: String(a.title ?? ""),
    content: String(a.content ?? ""),
    issuedBy: String(a.issuedBy ?? ""),
    issuedAt:
      typeof a.issuedAt === "string"
        ? a.issuedAt
        : new Date(a.issuedAt ?? Date.now()).toISOString(),
    status: (a.status as PublicAdvisory["status"]) ?? "draft",
    targetRegions: Array.isArray(a.targetRegions)
      ? (a.targetRegions as string[])
      : [],
    severityLevel:
      (a.severityLevel as PublicAdvisory["severityLevel"]) ?? "info",
    validUntil: a.validUntil
      ? typeof a.validUntil === "string"
        ? a.validUntil
        : new Date(a.validUntil).toISOString()
      : undefined,
    attachments: Array.isArray(a.attachments)
      ? (a.attachments as string[])
      : [],
    relatedReportId: a.relatedReportId ?? undefined,
  };
};

export const getPublicAdvisories = async (): Promise<PublicAdvisory[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch public advisories");
  }
  const data = await response.json();
  const list = Array.isArray(data) ? data : data?.items ?? [];
  return list.map(mapPublicAdvisory);
};
