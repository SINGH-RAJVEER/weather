import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { MapPin, AlertTriangle } from "lucide-react-native";

const MapViewComponent = ({ reports, isLoading }) => {
  const [activeReport, setActiveReport] = useState(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-neutral-600 mt-4">Loading map data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 13.067439,
          longitude: 80.237617,
          latitudeDelta: 2,
          longitudeDelta: 2,
        }}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.location.lat,
              longitude: report.location.lng,
            }}
            onPress={() => setActiveReport(report)}
          >
            {/* Custom marker */}
            <View
              className={`w-8 h-8 items-center justify-center rounded-full border-2 border-white shadow-lg ${
                report.severity === "critical"
                  ? "bg-red-600"
                  : report.severity === "high"
                    ? "bg-orange-500"
                    : report.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
              }`}
            >
              <MapPin size={18} color="white" />
            </View>

            {/* Callout (tooltip/info window) */}
            <Callout tooltip>
              <View className="bg-white p-3 rounded-lg shadow border border-neutral-200 w-64">
                <View className="flex-row items-center space-x-2 mb-2">
                  <AlertTriangle
                    size={14}
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
                  <Text className="font-medium text-sm">
                    {report.type} ({report.severity})
                  </Text>
                </View>
                <Text className="text-xs text-neutral-600 mb-1">
                  {report.description}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {report.location.address}
                </Text>
                <Text className="text-xs text-neutral-500">
                  Reported by: {report.userName}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

export default MapViewComponent;
