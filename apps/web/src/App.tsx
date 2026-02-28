import type { AnalystReport } from "@weather/types";
import type React from "react";
import { useEffect, useState } from "react";
import { AnalystReportForm } from "./components/Analyst/AnalystReport/AnalystReportForm";
import { AnalyticsDashboard } from "./components/Analyst/AnalyticsDashboard";
import { AuthForm } from "./components/Auth/AuthForm";
import UnauthorizedPage from "./components/Common/UnauthorizedPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import AllReportsPage from "./components/Dashboard/RecentReports/AllReportsPage";
import ReportDetailPage from "./components/Dashboard/RecentReports/ReportDetailPage";
import { ReportForm } from "./components/HazardReport/ReportForm";
import { Header } from "./components/Layout/Header";
import MapView from "./components/Map/MapView";
import LiveRiskScore from "./components/Map/OfficialMapView";
import IssueAdvisoryPage from "./components/Official/IssueAdvisoryPage";
import { OfficialReportsView } from "./components/Official/OfficialReportsView";
import { EditProfilePage } from "./components/Profile/EditProfilePage";
import SocialMonitor from "./components/Social/SocialMonitor";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { LocationProvider } from "./contexts/LocationContext";

interface CustomWindow extends Window {
  navigateTo?: (page: string) => void;
}

const AppContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: dataLoading, reports } = useData();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [advisoryReportData, setAdvisoryReportData] = useState<AnalystReport | null>(null);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "official":
          setCurrentPage("map");
          break;
        case "analyst":
          setCurrentPage("analyst-report");
          break;
        default:
          setCurrentPage("dashboard");
          break;
      }
    }
  }, [user]);

  useEffect(() => {
    (window as CustomWindow).navigateTo = setCurrentPage;
    return () => {
      delete (window as CustomWindow).navigateTo;
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gap-blue text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-blue mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold mb-2">Weather</h1>
          <p className="opacity-80">Weather Reporting Engine</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderPageContent = () => {
    // Handle dynamic report detail route: "report-detail:<id>"
    if (currentPage.startsWith("report-detail:")) {
      const id = currentPage.split(":")[1];
      const report = reports.find((r) => r.id === id) || null;
      return <ReportDetailPage report={report} onBack={() => setCurrentPage("dashboard")} />;
    }
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />;

      case "report":
        return (
          <div className="max-w-4xl mx-auto">
            {user?.role === "analyst" ? (
              <AnalystReportForm onSubmit={() => setCurrentPage("dashboard")} />
            ) : (
              <ReportForm
                onSubmit={() => setCurrentPage("dashboard")}
                onBack={() => setCurrentPage("dashboard")}
              />
            )}
          </div>
        );

      case "map":
        return user?.role === "official" ? <LiveRiskScore /> : <MapView />;

      case "official-reports":
        if (user?.role !== "official") {
          return <UnauthorizedPage />;
        }
        return (
          <div className="max-w-7xl mx-auto">
            <OfficialReportsView
              setAdvisoryReportData={setAdvisoryReportData}
              setCurrentPage={setCurrentPage}
            />
          </div>
        );

      case "issue-advisory":
        if (user?.role !== "official") {
          return <UnauthorizedPage />;
        }
        return (
          <div className="max-w-4xl mx-auto">
            <IssueAdvisoryPage
              reportData={advisoryReportData}
              onBack={() => setCurrentPage("official-reports")}
            />
          </div>
        );

      case "recent-reports":
        return (
          <div className="max-w-7xl mx-auto">
            <AllReportsPage
              onBack={() => setCurrentPage("dashboard")}
              reports={reports}
              isLoading={dataLoading}
            />
          </div>
        );

      case "analyst-report":
        if (user?.role !== "analyst") {
          return <UnauthorizedPage />;
        }
        return (
          <div className="max-w-7xl mx-auto">
            <AnalystReportForm onSubmit={() => setCurrentPage("dashboard")} />
          </div>
        );

      case "analytics":
        if (user?.role !== "analyst" && user?.role !== "official") {
          return <UnauthorizedPage />;
        }
        return <AnalyticsDashboard />;

      case "social-monitor":
        return <SocialMonitor />;

      case "edit-profile":
        return (
          <div className="max-w-4xl mx-auto">
            <EditProfilePage onBack={() => setCurrentPage("dashboard")} />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-text-secondary">Page not found</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gap-blue text-white">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main
        className={`${
          currentPage === "map" ? "h-[calc(100vh-4rem)]" : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
        }`}
      >
        {renderPageContent()}{" "}
      </main>
    </div>
  );
};

// trigger hot reload
function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
