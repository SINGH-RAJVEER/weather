import type {
  IAnalystReport,
  IHazardReport,
  INewsArticle,
  IPublicAdvisory,
  IUser,
} from "@weather/database";
import type {
  AnalystReport,
  HazardReport,
  NewsArticle,
  PublicAdvisory,
  User,
} from "@weather/types";

type PrimitiveId = { _id?: { toString: () => string } | string; id?: string };

const getId = (value: PrimitiveId): string => {
  if (value.id) return value.id;
  if (typeof value._id === "string") return value._id;
  if (value._id && typeof value._id.toString === "function") {
    return value._id.toString();
  }
  return Math.random().toString(36).slice(2, 11);
};

export const normalizeDbUser = (user: Partial<IUser> & PrimitiveId): User => ({
  id: getId(user),
  email: user.email ?? "unknown@example.com",
  name: user.name ?? "Unknown User",
  role: (user.role as User["role"]) ?? "citizen",
  profilePicture: user.profilePicture,
});

export const normalizeDbHazardReport = (
  report: Partial<IHazardReport> & PrimitiveId & { userId?: string }
): HazardReport => ({
  id: getId(report),
  userId: report.userId ?? "unknown",
  userName: report.userName ?? "Anonymous User",
  type: (report.type as HazardReport["type"]) ?? "other",
  severity: (report.severity as HazardReport["severity"]) ?? "low",
  description: report.description ?? "",
  location: {
    lat: report.location?.lat ?? 0,
    lng: report.location?.lng ?? 0,
    address: report.location?.address ?? "Unknown location",
  },
  timestamp:
    report.timestamp instanceof Date
      ? report.timestamp.toISOString()
      : new Date(report.timestamp ?? Date.now()).toISOString(),
  media: report.media,
  verified: Boolean(report.verified),
  likes: report.likes ?? 0,
  comments: report.comments ?? 0,
});

export const normalizeDbNewsArticle = (
  article: Partial<INewsArticle> & PrimitiveId
): NewsArticle => ({
  id: getId(article),
  title: article.title ?? "Untitled",
  summary: article.summary ?? "",
  source: article.source ?? "Unknown",
  publishedAt:
    article.publishedAt instanceof Date
      ? article.publishedAt.toISOString()
      : new Date(article.publishedAt ?? Date.now()).toISOString(),
  url: article.url ?? "#",
  category: (article.category as NewsArticle["category"]) ?? "weather",
  relevanceScore: article.relevanceScore ?? 0,
  location: article.location,
});

export const normalizeDbAnalystReport = (
  report: Partial<IAnalystReport> & PrimitiveId
): AnalystReport => ({
  id: getId(report),
  title: report.title ?? "Untitled",
  analyst: report.analystName ?? "Unknown",
  reportType: "situation_report",
  priority: "medium",
  affectedRegions: [],
  hazardTypes: [],
  summary: report.summary ?? "",
  detailedAnalysis: report.details ?? "",
  confidenceLevel: "medium",
  submittedAt:
    report.createdAt instanceof Date
      ? report.createdAt.toISOString()
      : new Date(report.createdAt ?? Date.now()).toISOString(),
  validUntil: report.updatedAt instanceof Date ? report.updatedAt.toISOString() : report.updatedAt,
  reviewedBy: report.analystId,
  reviewedAt: report.updatedAt instanceof Date ? report.updatedAt.toISOString() : report.updatedAt,
  attachments: report.attachments?.length ?? 0,
  isApproved: Boolean(report.isApproved),
});

export const normalizeDbPublicAdvisory = (
  advisory: Partial<IPublicAdvisory> & PrimitiveId
): PublicAdvisory => ({
  id: getId(advisory),
  title: advisory.title ?? "Untitled",
  content: advisory.content ?? "",
  issuedBy: advisory.issuedBy ?? "Unknown",
  issuedAt:
    advisory.issuedAt instanceof Date
      ? advisory.issuedAt.toISOString()
      : new Date(advisory.issuedAt ?? Date.now()).toISOString(),
  status: (advisory.status as PublicAdvisory["status"]) ?? "draft",
  targetRegions: advisory.targetRegions ?? [],
  severityLevel: (advisory.severityLevel as PublicAdvisory["severityLevel"]) ?? "info",
  validUntil:
    advisory.validUntil instanceof Date ? advisory.validUntil.toISOString() : advisory.validUntil,
  attachments: advisory.attachments,
  relatedReportId: advisory.relatedReportId,
});
