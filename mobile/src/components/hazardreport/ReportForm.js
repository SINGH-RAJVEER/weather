// ReportForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
// Removed SafeAreaView to rely on root SafeAreaProvider context
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  AlertTriangle,
  MapPin,
  Camera,
  Send,
  Loader,
  ArrowLeft,
} from "lucide-react-native";

import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";

const ReportForm = ({ onSubmit }) => {
  const { addReport } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: "high_waves",
    severity: "medium",
    description: "",
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: "Chennai, Tamil Nadu, India",
    },
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const hazardTypeLabels = {
    high_waves: "High Waves",
    flooding: "Flooding",
    oil_spill: "Oil Spill",
    erosion: "Erosion",
  };

  const severityLabels = {
    low: "Low - Minor",
    medium: "Medium - Noticeable",
    high: "High - Dangerous",
    critical: "Critical - Immediate Threat",
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-100 border-red-200 text-red-700";
      case "high":
        return "bg-orange-100 border-orange-200 text-orange-700";
      case "medium":
        return "bg-yellow-100 border-yellow-200 text-yellow-700";
      case "low":
        return "bg-green-100 border-green-200 text-green-700";
      default:
        return "bg-neutral-100 border-neutral-200 text-neutral-700";
    }
  };

  const pickFiles = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedFiles(result.assets.map((a) => a.uri));
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        setLocationLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const address = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      setFormData((prev) => ({
        ...prev,
        location: {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          address,
        },
      }));
    } catch (err) {
      console.error("Location error:", err);
    }
    setLocationLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) return;
    setIsSubmitting(true);

    try {
      // Create the report data structure
      const reportData = {
        userId: user?.id || "unknown",
        userName: user?.name || "Anonymous User",
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        location: formData.location,
      };

      // Add the report to the data context
      addReport(reportData);

      // simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Report submitted and added to dashboard:", reportData);

      // Reset form
      setFormData((prev) => ({
        ...prev,
        description: "",
        type: "high_waves",
        severity: "medium",
      }));
      setSelectedFiles([]);

      // Call the onSubmit prop to navigate back if provided
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Back Button and Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => onSubmit && onSubmit()}
            className="mr-4 p-2 rounded-lg bg-neutral-100"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View className="bg-orange-100 p-2 rounded-lg mr-3">
            <AlertTriangle size={24} color="#ea580c" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-neutral-900">
              Report Ocean Hazard
            </Text>
            <Text className="text-sm text-neutral-600">
              Help protect coastal communities by reporting hazard observations
            </Text>
          </View>
        </View>

        {/* Hazard Type */}
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          Hazard Type
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {Object.entries(hazardTypeLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFormData((prev) => ({ ...prev, type: key }))}
              className={`px-4 py-2 rounded-lg border mr-2 mb-2 ${
                formData.type === key
                  ? "bg-sky-500 border-sky-600"
                  : "bg-neutral-100 border-neutral-300"
              }`}
            >
              <Text
                className={`text-sm ${
                  formData.type === key
                    ? "text-white font-medium"
                    : "text-neutral-700"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Severity */}
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          Severity Level
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {Object.entries(severityLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() =>
                setFormData((prev) => ({ ...prev, severity: key }))
              }
              className={`px-4 py-2 rounded-lg border mr-2 mb-2 ${
                formData.severity === key
                  ? "bg-sky-500 border-sky-600"
                  : getLevelColor(key)
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  formData.severity === key ? "text-white" : ""
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          Detailed Description
        </Text>
        <TextInput
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
          placeholder="Describe what you observed..."
          multiline
          numberOfLines={4}
          className="w-full border border-neutral-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        {/* Location */}
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          Location
        </Text>
        <View className="flex-row items-center mb-4">
          <TextInput
            value={formData.location.address}
            editable={false}
            className="flex-1 border border-neutral-300 rounded-lg px-4 py-3 bg-neutral-50 text-neutral-600"
          />
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={locationLoading}
            className="ml-2 px-4 py-3 bg-sky-500 rounded-lg flex-row items-center"
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MapPin size={18} color="#fff" />
            )}
            <Text className="ml-1 text-white font-medium">
              {locationLoading ? "Getting..." : "Current"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Preview */}
        <View className="h-32 w-full bg-neutral-200 rounded-lg mb-4 items-center justify-center">
          <Text className="text-neutral-600">[Map Preview Placeholder]</Text>
        </View>

        {/* File Upload */}
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          Photos/Videos (Optional)
        </Text>
        <TouchableOpacity
          onPress={pickFiles}
          className="border-2 border-dashed border-neutral-300 rounded-lg p-6 items-center mb-2"
        >
          <Camera size={32} color="#9ca3af" />
          <Text className="text-sm text-neutral-600 mt-2">
            Tap to upload photos or videos
          </Text>
        </TouchableOpacity>
        {selectedFiles.length > 0 && (
          <Text className="text-sm text-neutral-600 mb-4">
            Selected files: {selectedFiles.length}
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          disabled={isSubmitting || !formData.description.trim()}
          onPress={handleSubmit}
          className="w-full bg-sky-500 py-3 rounded-lg flex-row items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader size={20} className="animate-spin" color="white" />
              <Text className="ml-2 text-white">Submitting Report...</Text>
            </>
          ) : (
            <>
              <Send size={20} color="white" />
              <Text className="ml-2 text-white font-medium">
                Submit Hazard Report
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReportForm;
