import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  AlertTriangle,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  CheckCircle2,
} from "lucide-react-native";

import {
  formatDate,
  hazardTypeLabels,
  severityColors,
} from "../../../utils/utils";

export default function RecentReports({ reports, isLoading, onNavigate }) {
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <View className="p-4 border border-neutral-200 rounded-lg bg-white">
        <Text className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Reports
        </Text>
        {[...Array(3)].map((_, i) => (
          <View
            key={i}
            className="p-4 border border-neutral-200 rounded-lg mb-3 bg-neutral-100"
          >
            <View className="h-4 bg-neutral-300 rounded-sm mb-2" />
            <View className="h-3 bg-neutral-300 rounded-sm w-2/3" />
          </View>
        ))}
      </View>
    );
  }

  const recentReports = reports.slice(0, 5);

  return (
    <View className="p-4 border border-neutral-200 rounded-lg bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-lg font-semibold text-neutral-900">
          Recent Reports
        </Text>
        <TouchableOpacity
          onPress={() => onNavigate && onNavigate("recent-reports")}
        >
          <Text className="text-sm text-sky-600 font-medium">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Reports */}
      <View>
        {recentReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            onPress={() =>
              setExpandedId((prev) => (prev === report.id ? null : report.id))
            }
            className="mb-4 p-4 border border-neutral-200 rounded-lg bg-white"
          >
            {/* Row 1 */}
            <View className="flex-row mb-3">
              <View
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor:
                    report.severity === "critical"
                      ? "#fecaca"
                      : report.severity === "high"
                        ? "#fed7aa"
                        : report.severity === "medium"
                          ? "#fef3c7"
                          : "#bbf7d0",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-start",
                }}
              >
                <AlertTriangle
                  size={16}
                  color={
                    report.severity === "critical"
                      ? "#dc2626"
                      : report.severity === "high"
                        ? "#ea580c"
                        : report.severity === "medium"
                          ? "#ca8a04"
                          : "#16a34a"
                  }
                />
              </View>

              <View className="ml-3 flex-1">
                <View className="flex-row items-center mb-1 flex-wrap">
                  <Text className="text-sm font-medium text-neutral-900 mr-2">
                    {hazardTypeLabels[report.type]}
                  </Text>
                  <Text
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      severityColors[report.severity]
                    }`}
                  >
                    {report.severity.charAt(0).toUpperCase() +
                      report.severity.slice(1)}
                  </Text>
                  {report.verified && (
                    <CheckCircle2 size={16} color="#22c55e" className="ml-1" />
                  )}
                </View>
                <Text
                  className="text-sm text-neutral-600"
                  numberOfLines={2} // 👈 replaces line-clamp-2
                >
                  {report.description}
                </Text>
              </View>
            </View>

            {/* Row 2 - Split into two rows for better mobile layout */}
            <View className="space-y-2">
              {/* Location and Time */}
              <View className="flex-row space-x-4">
                <View className="flex-row items-center space-x-1 flex-1">
                  <MapPin size={12} color="#6b7280" />
                  <Text
                    className="text-xs text-neutral-500 flex-1"
                    numberOfLines={1}
                  >
                    {report.location.address}
                  </Text>
                </View>
              </View>

              {/* Time, Likes, and Comments */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-1">
                  <Clock size={12} color="#6b7280" />
                  <Text className="text-xs text-neutral-500">
                    {formatDate(report.timestamp)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 6 }}>
                  <View className="flex-row items-center space-x-1">
                    <ThumbsUp size={12} color="#6b7280" />
                    <Text className="text-xs text-neutral-500">
                      {report.likes}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-1">
                    <MessageCircle size={12} color="#6b7280" />
                    <Text className="text-xs text-neutral-500">
                      {report.comments}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Expanded details inline */}
            {expandedId === report.id && (
              <View className="mt-3 pt-3 border-t border-neutral-200">
                <Text className="text-sm font-medium text-neutral-700 mb-1">
                  Full Description
                </Text>
                <Text className="text-neutral-800 mb-3">
                  {report.description}
                </Text>

                <View className="flex-row items-center mb-2">
                  {report.verified && (
                    <CheckCircle2 size={14} color="#22c55e" />
                  )}
                  <Text className="ml-2 text-sm text-neutral-700">
                    Status: {report.verified ? "Verified" : "Pending"}
                  </Text>
                </View>

                <Text className="text-xs text-neutral-500">
                  Reported by: {report.userName}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
