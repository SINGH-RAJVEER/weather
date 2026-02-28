export interface User {
  id: string;
  email: string;
  name: string;
  role: "citizen" | "official" | "analyst";
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  profilePicture?: string;
}

export interface HazardReport {
  id: string;
  userId: string;
  userName: string;
  type:
    | "tsunami"
    | "storm_surge"
    | "high_waves"
    | "swell_surge"
    | "coastal_current"
    | "flooding"
    | "coastal_damage"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  media?: string[];
  verified: boolean;
  likes: number;
  comments: number;
}

export interface SocialMediaPost {
  id: string;
  platform: "twitter" | "facebook" | "youtube";
  content: string;
  author: string;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  sentiment: "positive" | "negative" | "neutral";
  hazardRelevance: number;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface MapHotspot {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  intensity: number;
  reportCount: number;
  dominantHazardType: string;
  radius: number;
}

export interface DashboardStats {
  totalReports: number;
  verifiedReports: number;
  activeHazards: number;
  socialMediaMentions: number;
  trendingHashtags: string[];
  sentimentScore: number;
  recentActivity: {
    newReports: number;
    newVerifications: number;
    newHazards: number;
    newMentions: number;
  };
}

export interface PublicAdvisory {
  id: string;
  title: string;
  content: string;
  issuedBy: string;
  issuedAt: string;
  status: "draft" | "published" | "archived";
  targetRegions: string[];
  severityLevel: "info" | "warning" | "emergency";
  validUntil?: string;
  attachments?: string[];
  relatedReportId?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category: "breaking" | "environment" | "disaster" | "local" | "weather";
  relevanceScore: number;
  location?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  role?: "citizen" | "official" | "analyst";
}

export interface AnalystReport {
  title: string;
  analyst: string;
  reportType: "situation_report" | "risk_assessment" | "forecast_update" | "emergency_alert";
  priority: "low" | "medium" | "high" | "urgent";
  affectedRegions: string[];
  hazardTypes: string[];
  summary: string;
  detailedAnalysis: string;
  confidenceLevel: "low" | "medium" | "high";
  submittedAt: string;
  validUntil?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  attachments: number;
  isApproved: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: User["role"]) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedUser: {
    name?: string;
    email?: string;
    password?: string;
  }) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  isLoading: boolean;
}

export interface HWAReport {
  id: number;
  District?: string;
  State?: string;
  city?: string;
  state?: string;
  hazardType: string;
  severityScore?: number;
  color?: "Green" | "Yellow" | "Orange" | "Red" | string;
  Color?: string;
  forecastPeriod?: string;
  currentAdvisory?: string;
  advisory?: string;
  waveHeight?: string | number;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export type LayerToggle = {
  heatmap: boolean;
  swellHeat: boolean;
  swellDots: boolean;
  density: boolean;
};
