import { Plus } from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { LocationSummary } from "./LocationSummary";
import AllNewsPage from "./NewsSection/AllNewsPage";
import { NewsSection } from "./NewsSection/NewsSection";
import { PSABanner } from "./PSABanner";
import { RecentReports } from "./RecentReports/RecentReports";

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useTranslation("dashboard");
  const { t: tReports } = useTranslation("reports");

  const { newsArticles, reports, isLoading } = useData();
  const [showAllNews, setShowAllNews] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user || user.role !== "citizen") {
    return <div className="p-8 text-center text-neutral-500">{t("accessDenied")}</div>;
  }

  return (
    <div className="flex flex-col">
      {!showAllNews ? (
        <>
          <PSABanner />
          <LocationSummary className="mb-8" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 h-full">
              <RecentReports
                reports={reports}
                isLoading={isLoading}
                className="mb-8"
                onNavigate={onNavigate}
              />
            </div>
            <div className="lg:w-1/2 h-full">
              <NewsSection
                articles={newsArticles}
                isLoading={isLoading}
                onViewAll={() => setShowAllNews(true)}
                className="mb-8"
              />
            </div>
          </div>
        </>
      ) : (
        <AllNewsPage
          articles={newsArticles}
          isLoading={isLoading}
          onBack={() => setShowAllNews(false)}
        />
      )}

      {/* Floating subtle circular Add button (opens hazard report form) */}
      <button
        type="button"
        aria-label={tReports("reportOceanHazard")}
        title={tReports("reportOceanHazard")}
        onClick={() => onNavigate?.("report")}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#03588c] text-white shadow-sm hover:bg-[#0462a0] focus:outline-none focus:ring-2 focus:ring-[#61bcc1] cursor-pointer"
      >
        <Plus className="h-8 w-8 mx-auto" />
      </button>
    </div>
  );
};

export default DashboardPage;
