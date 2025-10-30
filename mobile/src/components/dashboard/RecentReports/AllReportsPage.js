import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react-native";

// Utils (adapt from your web utils, re-export or rewrite as JS)
import {
  formatDate,
  hazardTypeLabels,
  severityColors,
} from "../../../utils/utils";

// Removed absolute overlay implementation to avoid covering the screen

export default function AllReportsPage({ reports, isLoading, onBack }) {
  // Track which card is expanded instead of showing a full-screen overlay
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-2 text-neutral-600">Loading reports...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-neutral-200 bg-white">
        <TouchableOpacity
          onPress={onBack}
          className="mr-4 p-2 rounded-lg bg-neutral-100"
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold text-neutral-900 flex-1">
          All Reports
        </Text>
      </View>

      {/* Reports List */}
      <ScrollView className="flex-1 px-4 py-4">
        {reports.map((report, index) => {
          const severityStyle =
            (severityColors && severityColors[report.severity]) ||
            "text-neutral-700 bg-neutral-100 border-neutral-200";

          return (
            <TouchableOpacity
              key={report.id}
              onPress={() =>
                setExpandedId((prev) => (prev === report.id ? null : report.id))
              }
              className="p-4 border border-neutral-200 rounded-lg bg-white shadow-sm mb-4"
              activeOpacity={0.7}
            >
              {/* Top row */}
              <View className="flex-row items-start mb-3">
                <View
                  className={`p-2 rounded-lg ${
                    report.severity === "critical"
                      ? "bg-red-100"
                      : report.severity === "high"
                        ? "bg-orange-100"
                        : report.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                  }`}
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
                    <Text className="text-sm font-medium mr-2">
                      {hazardTypeLabels[report.type]}
                    </Text>
                    <Text
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${severityStyle}`}
                    >
                      {report.severity.charAt(0).toUpperCase() +
                        report.severity.slice(1)}
                    </Text>
                    {report.verified && (
                      <CheckCircle2
                        size={16}
                        color="#22c55e"
                        className="ml-1"
                      />
                    )}
                  </View>
                  <Text className="text-sm text-neutral-600">
                    {report.description}
                  </Text>
                </View>
              </View>

              {/* Footer rows */}
              <View className="space-y-4">
                {/* Location row */}
                <View className="flex-row items-center">
                  <MapPin size={12} color="#6b7280" />
                  <Text
                    className="text-xs text-neutral-500 ml-1"
                    numberOfLines={1}
                  >
                    {report.location.address}
                  </Text>
                </View>

                {/* Timestamp and engagement row */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Clock size={12} color="#6b7280" />
                    <Text className="text-xs text-neutral-500 ml-1">
                      {formatDate(report.timestamp)}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className="flex-row items-center">
                      <ThumbsUp size={12} color="#6b7280" />
                      <Text className="text-xs text-neutral-500 ml-1">
                        {report.likes}
                      </Text>
                    </View>
                    <View
                      className="flex-row items-center"
                      style={{ marginLeft: 6 }}
                    >
                      <MessageCircle size={12} color="#6b7280" />
                      <Text className="text-xs text-neutral-500 ml-1">
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
                    Description
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
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
