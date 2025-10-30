import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import DashboardStats from "./DashboardStats";
import LocationSummary from "./LocationSummary";
import RecentReports from "./RecentReports/RecentReports";
import NewsSection from "./NewsSection/NewsSection";

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const { stats, newsArticles, reports, isLoading } = useData();

  if (!user || user.role !== "citizen") {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-neutral-500">Access denied.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardStats stats={stats} isLoading={isLoading} className="mb-8" />
        <LocationSummary className="mb-8" />
        <RecentReports
          reports={reports}
          isLoading={isLoading}
          className="mb-8"
          onNavigate={onNavigate}
        />
        <NewsSection articles={newsArticles} isLoading={isLoading} />
      </ScrollView>
    </View>
  );
}
