import type { AnalystReport, HazardReport, User } from "@weather/types";
import { API_BASE_URL } from "../constants";

/**
 * Generic API client for making HTTP requests
 * Works with both web (fetch) and React Native
 */

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Auth API
// ============================================

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: User["role"];
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  getCurrentUser: async (token: string): Promise<User> => {
    return apiRequest<User>("/user/me", { token });
  },

  updateProfile: async (
    userId: string,
    updates: Partial<Pick<User, "name" | "role" | "location">>,
    token: string
  ): Promise<User> => {
    return apiRequest<User>(`/user/${userId}`, {
      method: "PUT",
      body: updates,
      token,
    });
  },
};

// ============================================
// Hazard Report API
// ============================================

export interface HazardReportPayload {
  userId: string;
  userName: string;
  type: HazardReport["type"];
  severity: HazardReport["severity"];
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

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

export const hazardReportApi = {
  getAll: async (): Promise<HazardReport[]> => {
    const data = await apiRequest<any>("/hazard-reports");
    const list = Array.isArray(data) ? data : (data?.items ?? []);
    return list.map(mapHazardReport);
  },

  getById: async (id: string): Promise<HazardReport> => {
    const data = await apiRequest<any>(`/hazard-reports/${id}`);
    return mapHazardReport(data);
  },

  create: async (payload: HazardReportPayload, token?: string): Promise<HazardReport> => {
    const data = await apiRequest<any>("/hazard-reports", {
      method: "POST",
      body: payload,
      token,
    });
    return mapHazardReport(data);
  },

  verify: async (id: string, token: string): Promise<HazardReport> => {
    const data = await apiRequest<any>(`/hazard-reports/${id}/verify`, {
      method: "PATCH",
      token,
    });
    return mapHazardReport(data);
  },
};

// ============================================
// Analyst Report API
// ============================================

export interface AnalystReportPayload {
  analystId: string;
  analystName: string;
  title: string;
  summary: string;
  details?: string;
  relatedHazards?: string[];
  recommendations?: string;
  attachments?: string[];
}

export const analystReportApi = {
  getAll: async (): Promise<AnalystReport[]> => {
    return apiRequest<AnalystReport[]>("/analyst-reports");
  },

  getApproved: async (): Promise<AnalystReport[]> => {
    return apiRequest<AnalystReport[]>("/analyst-reports/approved");
  },

  getById: async (id: string): Promise<AnalystReport> => {
    return apiRequest<AnalystReport>(`/analyst-reports/${id}`);
  },

  create: async (payload: AnalystReportPayload, token?: string): Promise<AnalystReport> => {
    return apiRequest<AnalystReport>("/analyst-reports", {
      method: "POST",
      body: payload,
      token,
    });
  },

  approve: async (id: string, token: string): Promise<AnalystReport> => {
    return apiRequest<AnalystReport>(`/analyst-reports/${id}/approve`, {
      method: "PATCH",
      token,
    });
  },
};

// ============================================
// News Article API
// ============================================

export const newsArticleApi = {
  getAll: async (location?: string): Promise<any[]> => {
    let endpoint = "/news-articles";
    if (location) {
      endpoint += `?location=${encodeURIComponent(location)}`;
    }
    return apiRequest<any[]>(endpoint);
  },
};

// ============================================
// Public Advisory API
// ============================================

// Normalize backend MongoDB document to frontend PublicAdvisory shape
const mapPublicAdvisory = (a: any): any => {
  return {
    id: String(a.id ?? a._id ?? ""),
    title: String(a.title ?? ""),
    content: String(a.content ?? ""),
    issuedBy: String(a.issuedBy ?? ""),
    issuedAt:
      typeof a.issuedAt === "string"
        ? a.issuedAt
        : new Date(a.issuedAt ?? Date.now()).toISOString(),
    status: a.status ?? "draft",
    targetRegions: Array.isArray(a.targetRegions) ? a.targetRegions : [],
    severityLevel: a.severityLevel ?? "info",
    validUntil: a.validUntil
      ? typeof a.validUntil === "string"
        ? a.validUntil
        : new Date(a.validUntil).toISOString()
      : undefined,
    attachments: Array.isArray(a.attachments) ? a.attachments : [],
    relatedReportId: a.relatedReportId ?? undefined,
  };
};

export const publicAdvisoryApi = {
  getAll: async (): Promise<any[]> => {
    const data = await apiRequest<any>("/advisories");
    const list = Array.isArray(data) ? data : (data?.items ?? []);
    return list.map(mapPublicAdvisory);
  },

  create: async (payload: any, token: string): Promise<any> => {
    const data = await apiRequest<any>("/advisories", {
      method: "POST",
      body: payload,
      token,
    });
    return mapPublicAdvisory(data);
  },
};

// Export all API modules
export const api = {
  auth: authApi,
  hazardReports: hazardReportApi,
  analystReports: analystReportApi,
  newsArticles: newsArticleApi,
  publicAdvisories: publicAdvisoryApi,
};
