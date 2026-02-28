import type {
  DashboardStats,
  HazardReport,
  MapHotspot,
  NewsArticle,
  SocialMediaPost,
} from "@weather/types";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type NewReportPayload = Pick<
  HazardReport,
  "userId" | "userName" | "type" | "severity" | "description" | "location"
>;

type DataContextValue = {
  reports: HazardReport[];
  socialPosts: SocialMediaPost[];
  hotspots: MapHotspot[];
  stats: DashboardStats;
  newsArticles: NewsArticle[];
  addReport: (reportData: NewReportPayload) => void;
  updateReport: (id: string, updates: Partial<HazardReport>) => void;
  filteredReports: HazardReport[];
  setFilters: (newFilters: Record<string, unknown>) => void;
  isLoading: boolean;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export default function DataProvider({ children }: PropsWithChildren) {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([]);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
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
  const [filteredReports, setFilteredReports] = useState<HazardReport[]>([]);
  const [filters, setFiltersState] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      const mockReports: HazardReport[] = [
        {
          id: "1",
          userId: "1",
          userName: "Rajveer Singh",
          type: "high_waves",
          severity: "high",
          description:
            "Observing unusually high waves at Marina Beach. Wave height approximately 3-4 meters. Strong winds from northeast direction.",
          location: {
            lat: 13.0499,
            lng: 80.2824,
            address: "Marina Beach, Chennai",
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          verified: true,
          likes: 15,
          comments: 8,
        },
        {
          id: "2",
          userId: "2",
          userName: "Bidhya Baalan",
          type: "coastal_damage",
          severity: "medium",
          description:
            "Coastal erosion noticed near the fishing harbor. Several fishing boats damaged due to strong currents.",
          location: {
            lat: 13.1067,
            lng: 80.3005,
            address: "Kasimedu Fishing Harbor, Chennai",
          },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          verified: false,
          likes: 12,
          comments: 5,
        },
        {
          id: "3",
          userId: "3",
          userName: "Tamil Coastal Watch",
          type: "swell_surge",
          severity: "critical",
          description:
            "Major swell surge reported along Cuddalore coast. Water levels risen by 2 feet above normal. Immediate evacuation recommended for low-lying areas.",
          location: {
            lat: 11.748,
            lng: 79.7714,
            address: "Cuddalore, Tamil Nadu",
          },
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          verified: true,
          likes: 45,
          comments: 23,
        },
      ];

      const mockSocialPosts: SocialMediaPost[] = [
        {
          id: "s1",
          platform: "twitter",
          content:
            "High waves at Marina Beach today! Be careful near the shore. #ChennaiWeather #INCOIS",
          author: "@ChennaiWeatherWatch",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sentiment: "negative",
          hazardRelevance: 0.9,
          engagement: { likes: 234, shares: 67, comments: 45 },
        },
        {
          id: "s2",
          platform: "facebook",
          content:
            "Beautiful but dangerous waves at ECR today. Fishermen advised to stay away from sea.",
          author: "Chennai Coastal Alert",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          sentiment: "neutral",
          hazardRelevance: 0.8,
          engagement: { likes: 123, shares: 34, comments: 28 },
        },
      ];

      const mockHotspots: MapHotspot[] = [
        {
          id: "h1",
          location: { lat: 13.0499, lng: 80.2824 },
          intensity: 0.8,
          reportCount: 5,
          dominantHazardType: "high_waves",
          radius: 2000,
        },
        {
          id: "h2",
          location: { lat: 11.748, lng: 79.7714 },
          intensity: 0.95,
          reportCount: 8,
          dominantHazardType: "swell_surge",
          radius: 3000,
        },
      ];

      const mockNewsArticles: NewsArticle[] = [
        {
          id: "n1",
          title: "INCOIS Issues High Wave Alert for Tamil Nadu Coast",
          summary:
            "The Indian National Centre for Ocean Information Services has issued a high wave alert for the Tamil Nadu coast, with waves expected to reach 3-4 meters.",
          source: "The Hindu",
          publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          url: "#",
          category: "breaking",
          relevanceScore: 0.95,
          location: "Tamil Nadu",
        },
        {
          id: "n2",
          title: "Fishermen Advised to Avoid Deep Sea Fishing Due to Rough Weather",
          summary:
            "Meteorological department advises fishermen along the east coast to avoid venturing into deep sea due to expected rough weather conditions.",
          source: "Times of India",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          url: "#",
          category: "weather",
          relevanceScore: 0.88,
          location: "East Coast",
        },
        {
          id: "n3",
          title: "Coastal Areas on High Alert as Cyclonic Storm Approaches",
          summary:
            "Emergency response teams have been deployed to coastal districts as meteorological conditions indicate the formation of a cyclonic storm.",
          source: "Indian Express",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          url: "#",
          category: "local",
          relevanceScore: 0.92,
          location: "Andhra Pradesh",
        },
        {
          id: "n4",
          title: "INCOIS Launches New Early Warning System for Coastal Communities",
          summary:
            "The upgraded early warning system will provide more accurate and timely alerts to coastal communities about potential ocean hazards.",
          source: "Deccan Herald",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          url: "#",
          category: "environment",
          relevanceScore: 0.75,
          location: "National",
        },
      ];

      const normalizedReports = mockReports; // Already in HazardReport format

      setReports(normalizedReports);
      setSocialPosts(mockSocialPosts);
      setHotspots(mockHotspots);
      setNewsArticles(mockNewsArticles);
      setFilteredReports(normalizedReports);

      setStats({
        totalReports: normalizedReports.length,
        verifiedReports: normalizedReports.filter((r) => r.verified).length,
        activeHazards: mockHotspots.length,
        socialMediaMentions: mockSocialPosts.length,
        trendingHashtags: ["#ChennaiWeather", "#INCOIS", "#CoastalAlert", "#TsunamiWatch"],
        sentimentScore: 0.6,
        recentActivity: {
          newReports: 5,
          newVerifications: 2,
          newHazards: 1,
          newMentions: 12,
        },
      });

      setIsLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        recentActivity: {
          newReports: Math.floor(Math.random() * 3),
          newVerifications: Math.floor(Math.random() * 2),
          newHazards: Math.random() > 0.8 ? 1 : 0,
          newMentions: Math.floor(Math.random() * 8) + 2,
        },
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addReport = (reportData: NewReportPayload) => {
    const newReport: HazardReport = {
      ...reportData,
      id: Math.random().toString(36).slice(2, 11),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      verified: false,
    };

    setReports((prev) => [newReport, ...prev]);
    setStats((prev) => ({ ...prev, totalReports: prev.totalReports + 1 }));
  };

  const updateReport = (id: string, updates: Partial<HazardReport>) => {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, ...updates } : report))
    );
  };

  const setFilters = (newFilters: Record<string, unknown>) => {
    setFiltersState(newFilters);
    void filters;
    setFilteredReports(reports);
  };

  return (
    <DataContext.Provider
      value={{
        reports,
        socialPosts,
        hotspots,
        stats,
        newsArticles,
        addReport,
        updateReport,
        filteredReports,
        setFilters,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
