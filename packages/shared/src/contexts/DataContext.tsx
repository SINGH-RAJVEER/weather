import type {
  DashboardStats,
  HazardReport,
  MapHotspot,
  NewsArticle,
  PublicAdvisory,
} from "@weather/types";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

interface LocationInsights {
  riskLevel: "low" | "medium" | "high" | "critical";
  nearbyReportCount: number;
  hotspotIntensity?: number;
  topHazard?: string;
  lastReportedAt?: string | null;
  recommendedActions: string[];
}

interface DataContextType {
  reports: HazardReport[];
  hotspots: MapHotspot[];
  stats: DashboardStats;
  newsArticles: NewsArticle[];
  advisories: PublicAdvisory[];
  getLocationInsights: (location: string) => LocationInsights;
  addReport: (
    report: Omit<HazardReport, "id" | "timestamp" | "likes" | "comments" | "verified" | "media">
  ) => Promise<void>;
  updateReport: (id: string, updates: Partial<HazardReport>) => void;
  isLoading: boolean;
  getAdvisoriesForLocation: (location: string) => PublicAdvisory[];
  refreshData: () => Promise<void>;
}

const normalizeRegion = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
  selectedLocation?: string;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, selectedLocation = "" }) => {
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

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedReports, loadedAdvisories, news] = await Promise.all([
        api.hazardReports.getAll(),
        api.publicAdvisories.getAll(),
        api.newsArticles.getAll(selectedLocation),
      ]);

      setReports(loadedReports);
      setAdvisories(loadedAdvisories);
      setNewsArticles(news);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalReports: loadedReports.length,
        verifiedReports: loadedReports.filter((r) => r.verified).length,
      }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation]);

  // Initialize core data and refetch news when location changes
  useEffect(() => {
    let cancelled = false;
    const initializeOrUpdateData = async () => {
      setIsLoading(true);
      try {
        // Always ensure hazard reports and advisories are loaded at least once
        if (reports.length === 0) {
          const loadedReports = await api.hazardReports.getAll();
          if (!cancelled) setReports(loadedReports);
        }
        if (advisories.length === 0) {
          const loadedAdvisories = await api.publicAdvisories.getAll();
          if (!cancelled) setAdvisories(loadedAdvisories);
        }
        // Fetch news based on the currently selected location
        const news = await api.newsArticles.getAll(selectedLocation);
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

  const addReport = useCallback(
    async (
      reportData: Omit<
        HazardReport,
        "id" | "timestamp" | "likes" | "comments" | "verified" | "media"
      >
    ) => {
      try {
        const newReport = await api.hazardReports.create(reportData);
        setReports((prev) => [newReport, ...prev]);
        setStats((prev) => ({ ...prev, totalReports: prev.totalReports + 1 }));
      } catch (error) {
        console.error("Failed to add report:", error);
        throw error;
      }
    },
    []
  );

  const getAdvisoriesForLocation = useCallback(
    (location: string) => {
      if (!location) return [];
      const loc = normalizeRegion(location);
      const now = Date.now();
      return advisories
        .filter((a) => a.status === "published")
        .filter((a) => !a.validUntil || new Date(a.validUntil).getTime() > now)
        .filter((a) =>
          a.targetRegions.some((r: string) => {
            const nr = normalizeRegion(r);
            return (
              loc.includes(nr) || nr.includes(loc.split(",")[0]) || loc.split(",")[0].includes(nr)
            );
          })
        )
        .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
    },
    [advisories]
  );

  const updateReport = useCallback((id: string, updates: Partial<HazardReport>) => {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, ...updates } : report))
    );
  }, []);

  const getLocationInsights = useCallback(
    (location: string): LocationInsights => {
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
    },
    [reports, hotspots]
  );

  const value = useMemo<DataContextType>(
    () => ({
      reports,
      hotspots,
      stats,
      newsArticles,
      advisories,
      getLocationInsights,
      addReport,
      updateReport,
      isLoading,
      getAdvisoriesForLocation,
      refreshData,
    }),
    [
      reports,
      hotspots,
      stats,
      newsArticles,
      advisories,
      getLocationInsights,
      addReport,
      updateReport,
      isLoading,
      getAdvisoriesForLocation,
      refreshData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
