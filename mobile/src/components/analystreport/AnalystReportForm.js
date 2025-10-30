import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  FileText,
  Target,
  MapPin,
  Loader,
  ArrowLeft,
} from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import saveAnalystReport from "../../api/analystReport";

const mockLocationData = {
  Chennai: {
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    metrics: {
      totalReports: 45,
      verifiedReports: 32,
      activeHazards: 3,
      riskLevel: "high",
      dominantHazard: "High Waves",
      lastUpdate: "2 hours ago",
    },
  },
  Visakhapatnam: {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    coordinates: { lat: 17.6868, lng: 83.2185 },
    metrics: {
      totalReports: 28,
      verifiedReports: 21,
      activeHazards: 2,
      riskLevel: "medium",
      dominantHazard: "Storm Surge",
      lastUpdate: "1 hour ago",
    },
  },
};

export default function AnalystReportForm({ onSubmit }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState("location");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [reportData, setReportData] = useState({
    title: "",
    dateTime: "",
    location: "",
    hazards: "",
    impactAssessment: "",
    recommendations: "",
    attachments: [],
    status: "draft",
    analystId: user?.id || "",
  });

  const cities = Object.keys(mockLocationData);
  const filteredCities = cities.filter(
    (city) =>
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockLocationData[city].state
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const generateReport = async () => {
    if (!selectedLocation || !user) return;
    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsGenerating(false);
    setCurrentStep("form");
  };

  const handleChange = (field, value) => {
    setReportData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const finalReport = {
      ...reportData,
      location: selectedLocation
        ? `${selectedLocation.city}, ${selectedLocation.state}`
        : reportData.location,
    };

    await saveAnalystReport(finalReport);
    onSubmit && onSubmit(finalReport);
  };

  if (currentStep === "location") {
    return (
      <ScrollView className="p-4 space-y-6">
        <View className="bg-white p-4 rounded-xl shadow">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <View className="bg-blue-100 p-2 rounded-lg mr-3">
              <FileText size={24} color="#2563eb" />
            </View>
            <View>
              <Text className="text-xl font-bold text-neutral-900">
                Generate Report
              </Text>
              <Text className="text-sm text-neutral-600">
                Select a location to generate an analytical report
              </Text>
            </View>
          </View>

          {/* Search */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Search Location
          </Text>
          <View className="relative mb-6">
            <Target
              size={16}
              color="#9ca3af"
              style={{ position: "absolute", top: 14, left: 10 }}
            />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search by city or state..."
              className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-lg"
            />
          </View>

          {/* City list */}
          <View className="flex flex-col space-y-4">
            {filteredCities.map((city) => {
              const location = mockLocationData[city];
              const isSelected = selectedLocation?.city === city;

              return (
                <TouchableOpacity
                  key={city}
                  onPress={() =>
                    isSelected
                      ? setSelectedLocation(null)
                      : setSelectedLocation(location)
                  }
                  className={`p-4 rounded-lg border ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-neutral-200"
                  }`}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View>
                      <Text className="font-semibold text-neutral-900">
                        {location.city}
                      </Text>
                      <Text className="text-sm text-neutral-600">
                        {location.state}
                      </Text>
                    </View>
                    <Text
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(
                        location.metrics.riskLevel
                      )}`}
                    >
                      {location.metrics.riskLevel.toUpperCase()}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm text-neutral-600">
                      Reports: {location.metrics.totalReports}
                    </Text>
                    <Text className="text-sm text-neutral-600">
                      Verified: {location.metrics.verifiedReports}
                    </Text>
                    <Text className="text-sm text-neutral-600">
                      Hazards: {location.metrics.activeHazards}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Location */}
          {selectedLocation && (
            <View className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <View className="flex-row justify-between mb-4">
                <View className="flex-row items-center">
                  <MapPin size={20} color="#2563eb" />
                  <View className="ml-2">
                    <Text className="font-semibold text-neutral-900">
                      {selectedLocation.city}, {selectedLocation.state}
                    </Text>
                    <Text className="text-xs text-neutral-600">
                      {selectedLocation.coordinates.lat.toFixed(2)},{" "}
                      {selectedLocation.coordinates.lng.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(
                    selectedLocation.metrics.riskLevel
                  )}`}
                >
                  {selectedLocation.metrics.riskLevel.toUpperCase()} RISK
                </Text>
              </View>

              {/* Generate button */}
              <TouchableOpacity
                onPress={generateReport}
                disabled={isGenerating}
                className="w-full flex-row justify-center items-center py-3 rounded-lg bg-blue-500"
              >
                {isGenerating ? (
                  <>
                    <Loader size={18} className="mr-2" />
                    <Text className="text-white font-medium">
                      Generating...
                    </Text>
                  </>
                ) : (
                  <>
                    <FileText
                      size={18}
                      color="white"
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-white font-medium">
                      Generate Report
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (currentStep === "form") {
    return (
      <ScrollView className="p-4 space-y-6">
        <View className="bg-white p-4 rounded-xl shadow">
          {/* Back Button and Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => onSubmit && onSubmit()}
              className="mr-4 p-2 rounded-lg bg-neutral-100"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            <View className="bg-blue-100 p-2 rounded-lg mr-3">
              <FileText size={24} color="#2563eb" />
            </View>
            <View>
              <Text className="text-xl font-bold text-neutral-900">
                Complete Report
              </Text>
              <Text className="text-sm text-neutral-600">
                Fill in the details to finalize your report
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Report Title
          </Text>
          <TextInput
            value={reportData.title}
            onChangeText={(t) => handleChange("title", t)}
            placeholder="Enter report title"
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4"
          />

          {/* Date & Time */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Date & Time
          </Text>
          <TextInput
            value={reportData.dateTime}
            onChangeText={(t) => handleChange("dateTime", t)}
            placeholder="Enter date & time"
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4"
          />

          {/* Hazards */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Identified Hazards
          </Text>
          <TextInput
            value={reportData.hazards}
            onChangeText={(t) => handleChange("hazards", t)}
            placeholder="Enter identified hazards"
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4"
          />

          {/* Impact Assessment */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Impact Assessment
          </Text>
          <TextInput
            value={reportData.impactAssessment}
            onChangeText={(t) => handleChange("impactAssessment", t)}
            placeholder="Enter impact assessment"
            multiline
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4"
          />

          {/* Recommendations */}
          <Text className="text-sm font-medium text-neutral-700 mb-2">
            Recommendations
          </Text>
          <TextInput
            value={reportData.recommendations}
            onChangeText={(t) => handleChange("recommendations", t)}
            placeholder="Enter recommendations"
            multiline
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4"
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full flex-row justify-center items-center py-3 rounded-lg bg-green-500"
          >
            <FileText size={18} color="white" style={{ marginRight: 6 }} />
            <Text className="text-white font-medium">Save Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
}
