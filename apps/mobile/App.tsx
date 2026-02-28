import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AnalystReportForm from "./src/components/analystreport/AnalystReportForm";
import AnalyticsDashboard from "./src/components/analytics/AnalyticsDashboard";
import AuthForm from "./src/components/auth/AuthForm";
import DashboardPage from "./src/components/dashboard/DashboardPage";
import AllReportsPage from "./src/components/dashboard/RecentReports/AllReportsPage";
import ReportForm from "./src/components/hazardreport/ReportForm";
import Header from "./src/components/layout/Header";
import LiveRiskScore from "./src/components/maps/LiveRiskScore";
// import { OfficialReportsView } from "./src/components/official/OfficialReportsView";
import MapView from "./src/components/maps/MapView";
import AuthProvider, { useAuth } from "./src/contexts/AuthContext";
import DataProvider, { useData } from "./src/contexts/DataContext";
import LocationProvider from "./src/contexts/LocationContext";

import "./global.css";

const AppContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: dataLoading, reports } = useData();
  const [currentPage, setCurrentPage] = useState("dashboard");

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

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center px-8">
          <ActivityIndicator size="large" color="#0ea5e9" className="mb-6" />
          <Text className="text-2xl font-bold text-gray-900 mb-2">SHORE</Text>
          <Text className="text-gray-600 text-center">Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <StatusBar barStyle="dark-content" />
        <AuthForm />
      </SafeAreaView>
    );
  }

  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />;

      case "report":
        return user?.role === "analyst" ? (
          <AnalystReportForm onSubmit={() => setCurrentPage("dashboard")} />
        ) : (
          <ReportForm onSubmit={() => setCurrentPage("dashboard")} />
        );

      case "map":
        return (
          <View className="h-full">
            {user?.role === "official" ? (
              <LiveRiskScore />
            ) : (
              <MapView reports={reports} isLoading={dataLoading} />
            )}
          </View>
        );

      case "official-reports":
        return <View className="max-w-7xl mx-auto">{/* <OfficialReportsView /> */}</View>;

      case "recent-reports":
        return (
          <AllReportsPage
            onBack={() => setCurrentPage("dashboard")}
            reports={reports}
            isLoading={dataLoading}
          />
        );

      case "analyst-report":
        return (
          <View className="max-w-7xl mx-auto">
            <AnalystReportForm onSubmit={() => setCurrentPage("dashboard")} />
          </View>
        );

      case "analytics":
        return <AnalyticsDashboard />;

      default:
        return (
          <View className="items-center py-12">
            <Text className="text-gray-500">Page not found</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" />
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <View className={`flex-1 ${currentPage === "map" ? "" : "p-4"}`}>{renderPageContent()}</View>
    </SafeAreaView>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <LocationProvider>
            <AppContent />
          </LocationProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
