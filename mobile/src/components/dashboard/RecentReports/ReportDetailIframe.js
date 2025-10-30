import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import {
  X,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react-native";
import { formatDate } from "../../../utils/utils";

const severityColors = {
  critical: {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  low: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
  },
};

export default function ReportDetailModal({ report, onClose }) {
  if (!report) return null;
  const colors = severityColors[report.severity] || severityColors.low;

  return (
    <Modal visible={!!report} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-center items-center">
        <View className="bg-white rounded-2xl w-[90%] max-h-[85%] overflow-hidden">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-3 right-3 p-2 bg-neutral-100 rounded-full"
            onPress={onClose}
          >
            <X size={22} color="#374151" />
          </TouchableOpacity>

          <ScrollView
            className="p-4"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center mb-4">
              <View className={`p-3 rounded-lg ${colors.bg}`}>
                <AlertTriangle size={20} color="#dc2626" />
              </View>
              <Text className="ml-3 text-lg font-semibold text-neutral-900">
                {report.type.replace(/_/g, " ")}
              </Text>
              <View
                className={`ml-2 px-2 py-1 rounded-full border ${colors.border}`}
              >
                <Text className={`text-xs font-medium ${colors.text}`}>
                  {report.severity.charAt(0).toUpperCase() +
                    report.severity.slice(1)}
                </Text>
              </View>
              {report.verified && (
                <CheckCircle2 size={18} color="green" className="ml-2" />
              )}
            </View>

            {/* Images */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {report.media && report.media.length > 0 ? (
                report.media.map((url, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: url }}
                    className="w-36 h-36 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))
              ) : (
                <View className="w-36 h-36 bg-neutral-200 rounded-lg justify-center items-center mr-2">
                  <Text className="text-neutral-500 text-xs">No Image</Text>
                </View>
              )}
            </ScrollView>

            {/* Description */}
            <Text className="text-base text-neutral-700 mb-4">
              {report.description}
            </Text>

            {/* Meta Info */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <MapPin size={14} color="#64748b" />
                <Text className="ml-1 text-sm text-neutral-500">
                  {report.location.address}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={14} color="#64748b" />
                <Text className="ml-1 text-sm text-neutral-500">
                  {formatDate(report.timestamp)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row justify-between border-t border-neutral-200 pt-3">
              <View className="flex-row items-center">
                <ThumbsUp size={14} color="#64748b" />
                <Text className="ml-1 text-sm text-neutral-500">
                  {report.likes}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MessageCircle size={14} color="#64748b" />
                <Text className="ml-1 text-sm text-neutral-500">
                  {report.comments}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
