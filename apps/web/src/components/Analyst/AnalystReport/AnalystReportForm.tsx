import type React from "react";
import { useEffect, useState } from "react";
import { saveAnalystReport } from "../../../api/analystReport";
import { useAuth } from "../../../contexts/AuthContext";
import GeneratedReportForm from "./GeneratedReportForm";
import LocationSelection, { type LocationData } from "./LocationSelection";

type ReportType = "situation_report" | "risk_assessment" | "forecast_update" | "emergency_alert";
type Priority = "low" | "medium" | "high" | "urgent";
type ConfidenceLevel = "low" | "medium" | "high";

interface OfficialReportFormProps {
  onSubmit?: () => void;
}

const mockLocationData: Record<string, LocationData> = {
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
  Cuddalore: {
    city: "Cuddalore",
    state: "Tamil Nadu",
    coordinates: { lat: 11.748, lng: 79.7714 },
    metrics: {
      totalReports: 38,
      verifiedReports: 29,
      activeHazards: 4,
      riskLevel: "critical",
      dominantHazard: "Swell Surge",
      lastUpdate: "30 minutes ago",
    },
  },
  Paradip: {
    city: "Paradip",
    state: "Odisha",
    coordinates: { lat: 20.2648, lng: 86.6947 },
    metrics: {
      totalReports: 22,
      verifiedReports: 18,
      activeHazards: 1,
      riskLevel: "low",
      dominantHazard: "Coastal Current",
      lastUpdate: "4 hours ago",
    },
  },
  Kochi: {
    city: "Kochi",
    state: "Kerala",
    coordinates: { lat: 9.9312, lng: 76.2673 },
    metrics: {
      totalReports: 19,
      verifiedReports: 15,
      activeHazards: 2,
      riskLevel: "medium",
      dominantHazard: "High Waves",
      lastUpdate: "3 hours ago",
    },
  },
};

export const AnalystReportForm: React.FC<OfficialReportFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<"location" | "form">("location");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    reportType: "situation_report" as ReportType,
    priority: "medium" as Priority,
    affectedRegions: [] as string[],
    hazardTypes: [] as string[],
    summary: "",
    detailedAnalysis: "",
    dataSource: "",
    recommendations: "",
    validUntil: "",
    confidenceLevel: "medium" as ConfidenceLevel,
    attachments: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (currentStep === "form") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [currentStep]);

  const cities = Object.keys(mockLocationData);
  const filteredCities = cities.filter(
    (city) =>
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockLocationData[city].state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = async () => {
    if (!selectedLocation || !user) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const location = selectedLocation;
    const currentDate = new Date();
    const validUntilDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const generatedData = {
      title: `${location.metrics.dominantHazard} Alert - ${location.city}, ${location.state}`,
      reportType: (location.metrics.riskLevel === "critical"
        ? "emergency_alert"
        : location.metrics.riskLevel === "high"
          ? "risk_assessment"
          : "situation_report") as ReportType,
      priority: (location.metrics.riskLevel === "critical"
        ? "urgent"
        : location.metrics.riskLevel === "high"
          ? "high"
          : "medium") as Priority,
      affectedRegions: [location.state],
      hazardTypes: [location.metrics.dominantHazard],
      summary: `Current analysis of ocean conditions in ${location.city} indicates ${
        location.metrics.riskLevel
      } risk levels with ${location.metrics.dominantHazard.toLowerCase()} as the primary concern. Based on ${
        location.metrics.totalReports
      } citizen reports (${
        location.metrics.verifiedReports
      } verified) and real-time oceanographic data, immediate attention is required for coastal safety measures.`,
      detailedAnalysis: `Comprehensive analysis of oceanographic conditions in ${location.city} reveals:\n\n1. Wave Conditions: Significant wave heights ranging from 3-4 meters with dominant period of 8-10 seconds\n2. Tidal Analysis: Spring tide conditions contributing to elevated water levels\n3. Weather Patterns: Sustained onshore winds of 25-30 knots from northeast direction\n4. Historical Context: Similar conditions in the past have resulted in coastal flooding and infrastructure damage\n5. Citizen Reports: ${location.metrics.totalReports}\n\nReal-time monitoring stations indicate water levels are 0.5-1.0m above normal high tide levels. Coastal erosion patterns show accelerated activity in vulnerable areas.`,
      dataSource: `Data sources include:\n• INCOIS Real-time Ocean Monitoring Network\n• Citizen reporting platform (${location.metrics.totalReports} reports)\n• Meteorological Department weather stations\n• Satellite altimetry data\n• Coastal observation posts\n• Historical oceanographic database\n\nMethodology: Multi-source data fusion with machine learning algorithms for pattern recognition and risk assessment.`,
      recommendations: `Immediate Actions Required:\n\n1. EVACUATION: Issue evacuation advisory for low-lying coastal areas within 500m of shoreline\n2. EMERGENCY SERVICES: Deploy rescue teams to high-risk zones\n3. INFRASTRUCTURE: Close vulnerable coastal roads and bridges\n4. COMMUNICATION: Activate emergency broadcast systems\n5. MONITORING: Increase observation frequency to hourly updates\n6. COORDINATION: Establish emergency coordination center\n7. RESOURCES: Pre-position relief materials and medical supplies\n\nTimeline: Implement within 2-4 hours for maximum effectiveness.`,
      validUntil: validUntilDate.toISOString().slice(0, 16),
      confidenceLevel: "high" as ConfidenceLevel,
      attachments: [],
    };
    setFormData(generatedData);
    try {
      await saveAnalystReport({
        ...generatedData,
        analystId: user.id,
        analystName: user.name,
        location: {
          city: location.city,
          state: location.state,
          coordinates: location.coordinates,
        },
      });
    } catch (err) {
      console.error("Failed to save analyst report", err);
    }
    setIsGenerating(false);
    setCurrentStep("form");
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormData({
      title: "",
      reportType: "situation_report",
      priority: "medium",
      affectedRegions: [],
      hazardTypes: [],
      summary: "",
      detailedAnalysis: "",
      dataSource: "",
      recommendations: "",
      validUntil: "",
      confidenceLevel: "medium",
      attachments: [],
    });
    setCurrentStep("location");
    setSelectedLocation(null);
    setIsSubmitting(false);
    onSubmit?.();
  };

  if (currentStep === "location") {
    return (
      <LocationSelection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        filteredCities={filteredCities}
        mockLocationData={mockLocationData}
        isGenerating={isGenerating}
        onGenerate={generateReport}
      />
    );
  }

  return (
    <GeneratedReportForm
      formData={formData}
      setFormData={setFormData}
      onBack={() => setCurrentStep("location")}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      selectedLocationLabel={
        selectedLocation ? `${selectedLocation.city}, ${selectedLocation.state}` : undefined
      }
    />
  );
};
