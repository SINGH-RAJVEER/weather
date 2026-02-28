import type {
  DashboardStats,
  HazardReport,
  MapHotspot,
  NewsArticle,
  PublicAdvisory,
} from "@weather/types";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { addHazardReport, getHazardReports } from "../api/hazardReport";
import { getNewsArticles } from "../api/newsArticle";
import { getPublicAdvisories } from "../api/publicAdvisory";
import i18n from "../i18n/config";
import { useLocation } from "./LocationContext";

interface DataContextType {
  reports: HazardReport[];
  hotspots: MapHotspot[];
  stats: DashboardStats;
  newsArticles: NewsArticle[];
  advisories: PublicAdvisory[];
  getLocationInsights: (location: string) => {
    riskLevel: "low" | "medium" | "high" | "critical";
    nearbyReportCount: number;
    hotspotIntensity?: number;
    topHazard?: string;
    lastReportedAt?: string | null;
    recommendedActions: string[];
  };
  addReport: (
    report: Omit<HazardReport, "id" | "timestamp" | "likes" | "comments" | "verified" | "media">,
    mediaFiles: File[]
  ) => Promise<void>;
  updateReport: (id: string, updates: Partial<HazardReport>) => void;
  isLoading: boolean;
  getLocationDetails: (location: string) => {
    summary: string;
    actions: string[];
    headline?: string;
  } | null;
  getAdvisoriesForLocation: (location: string) => PublicAdvisory[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [hotspots] = useState<MapHotspot[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [advisories, setAdvisories] = useState<PublicAdvisory[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    verifiedReports: 0,
    activeHazards: 0,
    socialMediaMentions: 0,
    trendingHashtags: [],
    sentimentScore: 0,
    recentActivity: {
      newReports: 0,
      newVerifications: 0,
      newHazards: 0,
      newMentions: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const { selectedLocation } = useLocation();

  const knownLocations = [
    "Chennai",
    "Cuddalore",
    "Kasimedu",
    "Mumbai",
    "Kochi",
    "Visakhapatnam",
    "Kolkata",
  ];

  // Initialize core data and refetch news when location changes
  useEffect(() => {
    let cancelled = false;
    const initializeOrUpdateData = async () => {
      setIsLoading(true);
      try {
        // Always ensure hazard reports and advisories are loaded at least once
        if (reports.length === 0) {
          const loadedReports = await getHazardReports();
          if (!cancelled) setReports(loadedReports);
        }
        if (advisories.length === 0) {
          const loadedAdvisories = await getPublicAdvisories();
          if (!cancelled) setAdvisories(loadedAdvisories);
        }
        // Fetch news based on the currently selected location (address string)
        const news = await getNewsArticles(selectedLocation);
        if (!cancelled) setNewsArticles(news);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      if (!cancelled) setIsLoading(false);
    };

    initializeOrUpdateData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, advisories.length, reports.length]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        recentActivity: {
          newReports: Math.floor(Math.random() * 3),
          newVerifications: Math.floor(Math.random() * 2),
          newHazards: Math.random() > 0.8 ? 1 : 0,
          newMentions: Math.floor(Math.random() * 4),
        },
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const addReport = async (
    reportData: Omit<
      HazardReport,
      "id" | "timestamp" | "likes" | "comments" | "verified" | "media"
    >,
    mediaFiles: File[]
  ) => {
    try {
      const newReport = await addHazardReport(reportData, mediaFiles);
      setReports((prev) => [newReport, ...prev]);
      setStats((prev) => ({ ...prev, totalReports: prev.totalReports + 1 }));
    } catch (error) {
      console.error("Failed to add report:", error);
    }
  };

  const normalizeRegion = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

  const getAdvisoriesForLocation = (location: string) => {
    if (!location) return [];
    const loc = normalizeRegion(location);
    const now = Date.now();
    return advisories
      .filter((a) => a.status === "published")
      .filter((a) => !a.validUntil || new Date(a.validUntil).getTime() > now)
      .filter((a) =>
        a.targetRegions.some((r: string) => {
          const nr = normalizeRegion(r);
          // match if location includes region or region includes leading part of location
          return (
            loc.includes(nr) || nr.includes(loc.split(",")[0]) || loc.split(",")[0].includes(nr)
          );
        })
      )
      .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
  };

  const updateReport = (id: string, updates: Partial<HazardReport>) => {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, ...updates } : report))
    );
  };

  const getLocationDetails = (location: string) => {
    const key = knownLocations.find((k) => location.toLowerCase().includes(k.toLowerCase()));
    if (!key) return null;

    const base = `dashboard:locationDetails.${key}`;
    const summaryKey = `${base}.summary`;
    const headlineKey = `${base}.headline`;
    const actionsKey = `${base}.actions`;

    // Must have a translated summary; otherwise no location-specific details
    if (!i18n.exists(summaryKey)) return null;
    const summary = i18n.t(summaryKey) as string;

    // Headline is optional
    const headline = i18n.exists(headlineKey) ? (i18n.t(headlineKey) as string) : undefined;

    // Actions are optional and should be an array
    let actions: string[] = [];
    if (i18n.exists(actionsKey)) {
      const val = i18n.t(actionsKey, { returnObjects: true }) as unknown;
      if (Array.isArray(val)) actions = val as string[];
    }

    return { headline, summary, actions };
  };

  const getLocationInsights = (location: string) => {
    const matchedReports = reports.filter(
      (r) =>
        r.location.address?.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(r.location.address?.split(",")[0].toLowerCase())
    );

    const nearbyReportCount = matchedReports.length;
    const verifiedCount = matchedReports.filter((r) => r.verified).length;

    const hotspot = hotspots.find((h) =>
      matchedReports.some(
        (mr) => mr.location.lat === h.location.lat && mr.location.lng === h.location.lng
      )
    );

    const hotspotIntensity = hotspot?.intensity;

    const topHazardMap = matchedReports.reduce(
      (acc: Record<string, number>, cur) => {
        if (!acc[cur.type]) acc[cur.type] = 0;
        acc[cur.type]++;
        return acc;
      },
      {} as Record<string, number>
    );

    const topHazardType = Object.keys(topHazardMap).sort(
      (a, b) => topHazardMap[b] - topHazardMap[a]
    )[0];

    // Determine risk level heuristically
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (hotspotIntensity && hotspotIntensity > 0.85) riskLevel = "critical";
    else if (hotspotIntensity && hotspotIntensity > 0.6) riskLevel = "high";
    else if (nearbyReportCount > 3 || verifiedCount > 1) riskLevel = "medium";

    const lastReportedAt = matchedReports.length
      ? matchedReports
          .map((r) => new Date(r.timestamp))
          .sort((a, b) => +b - +a)[0]
          .toISOString()
      : null;

    const recommendedActions: string[] = [];
    if (riskLevel === "critical") {
      recommendedActions.push("Evacuate low-lying areas immediately");
      recommendedActions.push(
        "Follow directives from local authorities and disaster response teams"
      );
    } else if (riskLevel === "high") {
      recommendedActions.push("Avoid coastal access and small craft operations");
      recommendedActions.push("Monitor official advisories and stay tuned to local news");
    } else if (riskLevel === "medium") {
      recommendedActions.push("Exercise caution near the shoreline");
      recommendedActions.push("Secure loose outdoor items and vessels");
    } else {
      recommendedActions.push("No immediate action; stay informed");
    }

    return {
      riskLevel,
      nearbyReportCount,
      hotspotIntensity,
      topHazard: topHazardType,
      lastReportedAt,
      recommendedActions,
    };
  };

  return (
    <DataContext.Provider
      value={{
        reports,
        hotspots,
        stats,
        newsArticles,
        advisories,
        getLocationInsights,
        addReport,
        updateReport,
        isLoading,
        getLocationDetails,
        getAdvisoriesForLocation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
