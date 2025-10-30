import React from "react";
import { View, Text, ScrollView } from "react-native";
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  MapPin,
} from "lucide-react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const mockHazardData = [
  { name: "Jan", tsunami: 2, storm_surge: 5, high_waves: 12, flooding: 8 },
  { name: "Feb", tsunami: 1, storm_surge: 8, high_waves: 15, flooding: 10 },
  { name: "Mar", tsunami: 0, storm_surge: 12, high_waves: 20, flooding: 15 },
  { name: "Apr", tsunami: 3, storm_surge: 6, high_waves: 18, flooding: 12 },
  { name: "May", tsunami: 1, storm_surge: 9, high_waves: 25, flooding: 18 },
  { name: "Jun", tsunami: 0, storm_surge: 15, high_waves: 30, flooding: 22 },
];

const severityData = [
  { name: "Low", value: 35, color: "#22c55e" },
  { name: "Medium", value: 40, color: "#eab308" },
  { name: "High", value: 20, color: "#f97316" },
  { name: "Critical", value: 5, color: "#ef4444" },
];

const regionData = [
  { name: "Tamil Nadu", reports: 45, verified: 32 },
  { name: "Andhra Pradesh", reports: 38, verified: 28 },
  { name: "Odisha", reports: 29, verified: 22 },
  { name: "West Bengal", reports: 22, verified: 18 },
  { name: "Karnataka", reports: 18, verified: 14 },
];

export default function AnalyticsDashboard() {
  return (
    <ScrollView className="space-y-6 p-4 bg-neutral-50">
      {/* Key Metrics */}
      <View className="flex-row flex-wrap justify-between">
        {/* Metric Card */}
        <View className="w-[48%] bg-white p-4 rounded-lg mb-4">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 size={24} color="#2563eb" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">
                Total Reports
              </Text>
              <Text className="text-2xl font-bold text-neutral-900">1,247</Text>
              <Text className="text-xs text-green-600 font-medium">
                +15% from last month
              </Text>
            </View>
          </View>
        </View>

        <View className="w-[48%] bg-white p-4 rounded-lg mb-4">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} color="#16a34a" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">
                Verification Rate
              </Text>
              <Text className="text-2xl font-bold text-neutral-900">73%</Text>
              <Text className="text-xs text-green-600 font-medium">
                +5% improvement
              </Text>
            </View>
          </View>
        </View>

        <View className="w-[48%] bg-white p-4 rounded-lg mb-4">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-purple-100 rounded-lg">
              <Users size={24} color="#9333ea" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">
                Active Users
              </Text>
              <Text className="text-2xl font-bold text-neutral-900">8,456</Text>
              <Text className="text-xs text-green-600 font-medium">
                +8% growth
              </Text>
            </View>
          </View>
        </View>

        <View className="w-[48%] bg-white p-4 rounded-lg mb-4">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle size={24} color="#f97316" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">
                Active Hazards
              </Text>
              <Text className="text-2xl font-bold text-neutral-900">12</Text>
              <Text className="text-xs text-red-600 font-medium">
                +3 since yesterday
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Hazard Trends */}
      <View className="bg-white p-4 rounded-lg">
        <View className="flex-row items-center mb-4">
          <Calendar size={20} color="#4b5563" />
          <Text className="ml-2 text-lg font-semibold text-neutral-900">
            Hazard Trends by Month
          </Text>
        </View>
        <BarChart
          data={{
            labels: mockHazardData.map((d) => d.name),
            datasets: [
              { data: mockHazardData.map((d) => d.high_waves) },
              { data: mockHazardData.map((d) => d.storm_surge) },
              { data: mockHazardData.map((d) => d.flooding) },
              { data: mockHazardData.map((d) => d.tsunami) },
            ],
          }}
          width={screenWidth - 48}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          }}
          style={{ borderRadius: 12 }}
        />
      </View>

      {/* Severity Distribution */}
      <View className="bg-white p-4 rounded-lg">
        <View className="flex-row items-center mb-4">
          <AlertTriangle size={20} color="#4b5563" />
          <Text className="ml-2 text-lg font-semibold text-neutral-900">
            Severity Distribution
          </Text>
        </View>
        <PieChart
          data={severityData.map((s, i) => ({
            name: s.name,
            population: s.value,
            color: s.color,
            legendFontColor: "#374151",
            legendFontSize: 12,
          }))}
          width={screenWidth - 48}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            color: () => "#000",
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* Reports by Region */}
      <View className="bg-white p-4 rounded-lg">
        <View className="flex-row items-center mb-4">
          <MapPin size={20} color="#4b5563" />
          <Text className="ml-2 text-lg font-semibold text-neutral-900">
            Reports by Region
          </Text>
        </View>
        <BarChart
          data={{
            labels: regionData.map((r) => r.name),
            datasets: [
              { data: regionData.map((r) => r.reports) },
              { data: regionData.map((r) => r.verified) },
            ],
          }}
          width={screenWidth - 48}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(34,197,94, ${opacity})`,
          }}
          style={{ borderRadius: 12 }}
        />
      </View>

      {/* Daily Activity */}
      <View className="bg-white p-4 rounded-lg">
        <View className="flex-row items-center mb-4">
          <TrendingUp size={20} color="#4b5563" />
          <Text className="ml-2 text-lg font-semibold text-neutral-900">
            Daily Activity
          </Text>
        </View>
        <LineChart
          data={{
            labels: mockHazardData.map((d) => d.name),
            datasets: [
              {
                data: mockHazardData.map((d) => d.high_waves),
                color: () => "#3b82f6",
              },
              {
                data: mockHazardData.map((d) => d.storm_surge),
                color: () => "#14b8a6",
              },
            ],
          }}
          width={screenWidth - 48}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(107,114,128, ${opacity})`,
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      </View>

      {/* Summary "Table" as Cards */}
      <View className="bg-white p-4 rounded-lg">
        <Text className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Activity Summary
        </Text>
        {[
          {
            date: "2024-01-15",
            region: "Chennai",
            type: "High Waves",
            severity: "High",
            reports: 15,
            status: "Active",
          },
          {
            date: "2024-01-14",
            region: "Cuddalore",
            type: "Storm Surge",
            severity: "Medium",
            reports: 8,
            status: "Resolved",
          },
        ].map((item, idx) => (
          <View
            key={idx}
            className="p-3 mb-3 border border-neutral-200 rounded-lg"
          >
            <Text className="text-sm font-medium text-neutral-700">
              {item.date} - {item.region}
            </Text>
            <Text className="text-xs text-neutral-500">
              {item.type} ({item.severity})
            </Text>
            <Text className="text-xs text-neutral-500">
              Reports: {item.reports} | Status: {item.status}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
