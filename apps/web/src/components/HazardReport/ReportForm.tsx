import type { HazardReport } from "@weather/types";
import { AlertTriangle, Camera, Loader, MapPin, Send } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";

interface ReportFormProps {
  onSubmit?: () => void;
  onBack?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, onBack }) => {
  const { user } = useAuth();
  const { addReport } = useData();
  const { t } = useTranslation("reports");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    type: "high_waves" as HazardReport["type"],
    severity: "medium" as HazardReport["severity"],
    description: "",
    location: user?.location || {
      lat: 13.0827,
      lng: 80.2707,
      address: "Chennai, Tamil Nadu, India",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Define hazard types
  const hazardTypes = [
    "high_waves",
    "coastal_flooding",
    "storm_surge",
    "tsunami",
    "oil_spill",
    "marine_debris",
    "water_pollution",
    "unusual_behavior",
    "infrastructure_damage",
    "other",
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await addReport(
      {
        userId: user.id,
        userName: user.name,
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        location: formData.location,
      },
      selectedFiles
    );

    setFormData((prev) => ({ ...prev, description: "" }));
    setSelectedFiles([]); // Clear selected files
    setIsSubmitting(false);
    onSubmit?.();
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setFormData((prev) => ({
            ...prev,
            location: { lat: latitude, lng: longitude, address },
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="hazard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{t("reportOceanHazard")}</h2>
            <p className="text-sm text-neutral-600">{t("helpProtect")}</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 flex items-center gap-2"
          >
            {t("common:back")}
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t("hazardType")}
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as HazardReport["type"],
                }))
              }
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
            >
              {hazardTypes.map((key) => (
                <option key={key} value={key}>
                  {t(`hazardTypes.${key}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t("severityLevel")}
            </label>
            <select
              value={formData.severity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  severity: e.target.value as HazardReport["severity"],
                }))
              }
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
            >
              <option value="low">{t("severity.low")}</option>
              <option value="medium">{t("severity.medium")}</option>
              <option value="high">{t("severity.high")}</option>
              <option value="critical">{t("severity.critical")}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t("detailedDescription")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={t("describePlaceholder")}
            rows={4}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">{t("location")}</label>
          <div className="flex space-x-2">
            <input
              value={formData.location.address}
              readOnly
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
            >
              {locationLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {locationLoading ? t("getting") : t("currentLocation")}
              </span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t("photosVideos")}
          </label>
          <div
            className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-sky-400 transition-colors duration-200 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-600 mb-1">{t("clickUpload")}</p>
            <p className="text-xs text-neutral-500">{t("maxFiles")}</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files) {
                  setSelectedFiles(Array.from(e.target.files));
                }
              }}
            />
          </div>
          {selectedFiles.length > 0 && (
            <div className="mt-2 text-sm text-neutral-600">
              {t("selectedFiles")} {selectedFiles.map((file) => file.name).join(", ")}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.description.trim()}
          className="w-full bg-sky-500 text-white py-3 px-6 rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>{t("submittingReport")}</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>{t("submitHazardReport")}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
