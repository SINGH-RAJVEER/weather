import type { DashboardStats } from "@weather/types";
import {
  AlertTriangle,
  ArrowUp,
  CheckCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react-native";
import { Text, View } from "react-native";

interface DashboardStatsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const DashboardStats = ({ stats, isLoading }: DashboardStatsProps) => {
  if (isLoading) {
    return (
      <View className="flex-row flex-wrap justify-between mb-8">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="w-[48%] h-24 bg-neutral-200 rounded-lg mb-4 animate-pulse" />
        ))}
      </View>
    );
  }

  const statCards = [
    {
      title: "Total Reports",
      value: stats.totalReports,
      recentChange: stats.recentActivity.newReports,
      icon: MessageSquare,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
      change: "+12%",
      isLive: true,
    },
    {
      title: "Verified Reports",
      value: stats.verifiedReports,
      recentChange: stats.recentActivity.newVerifications,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      isLive: true,
    },
    {
      title: "Active Hazards",
      value: stats.activeHazards,
      recentChange: stats.recentActivity.newHazards,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "-5%",
      isLive: true,
    },
    {
      title: "Social Mentions",
      value: stats.socialMediaMentions,
      recentChange: stats.recentActivity.newMentions,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+24%",
      isLive: true,
    },
  ];

  return (
    <View className="flex-row flex-wrap justify-between mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <View key={index} className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow">
            {stat.isLive && (
              <View className="absolute top-2 right-2 flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                <Text className="text-xs text-green-600 font-medium">LIVE</Text>
              </View>
            )}

            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-600">{stat.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-2xl font-bold text-neutral-900">{stat.value}</Text>
                  {stat.recentChange > 0 && (
                    <View className="flex-row items-center bg-green-100 px-2 py-0.5 rounded-full ml-2">
                      <ArrowUp size={14} color="green" />
                      <Text className="text-xs font-medium text-green-600 ml-1">
                        +{stat.recentChange}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`text-xs font-medium mt-1 ${
                    stat.change.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change} from last week
                </Text>
              </View>

              <View className={`w-12 h-12 ${stat.bgColor} rounded-lg items-center justify-center`}>
                <Icon size={22} className={stat.color} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default DashboardStats;
