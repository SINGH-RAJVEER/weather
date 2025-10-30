import React, { useEffect } from "react";
import { FileText, Send, Loader, Calendar } from "lucide-react";

type ReportType =
  | "situation_report"
  | "risk_assessment"
  | "forecast_update"
  | "emergency_alert";
type Priority = "low" | "medium" | "high" | "urgent";
type ConfidenceLevel = "low" | "medium" | "high";

interface GeneratedReportFormProps {
  formData: {
    title: string;
    reportType: ReportType;
    priority: Priority;
    affectedRegions: string[];
    hazardTypes: string[];
    summary: string;
    detailedAnalysis: string;
    dataSource: string;
    recommendations: string;
    validUntil: string;
    confidenceLevel: ConfidenceLevel;
    attachments: File[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedLocationLabel?: string;
}

const reportTypes = [
  { value: "situation_report", label: "Situation Report" },
  { value: "risk_assessment", label: "Risk Assessment" },
  { value: "forecast_update", label: "Forecast Update" },
  { value: "emergency_alert", label: "Emergency Alert" },
];

const regions = [
  "Tamil Nadu",
  "Andhra Pradesh",
  "Odisha",
  "West Bengal",
  "Karnataka",
  "Kerala",
  "Gujarat",
  "Maharashtra",
];

const hazardTypes = [
  "Tsunami",
  "Storm Surge",
  "High Waves",
  "Swell Surge",
  "Coastal Current",
  "Coastal Flooding",
  "Coastal Damage",
  "Cyclone",
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-green-100 text-green-700 border-green-200";
  }
};

const GeneratedReportForm: React.FC<GeneratedReportFormProps> = ({
  formData,
  setFormData,
  onBack,
  onSubmit,
  isSubmitting,
  selectedLocationLabel,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleRegionToggle = (region: string) => {
    setFormData((prev: any) => ({
      ...prev,
      affectedRegions: prev.affectedRegions.includes(region)
        ? prev.affectedRegions.filter((r: string) => r !== region)
        : [...prev.affectedRegions, region],
    }));
  };

  const handleHazardToggle = (hazard: string) => {
    setFormData((prev: any) => ({
      ...prev,
      hazardTypes: prev.hazardTypes.includes(hazard)
        ? prev.hazardTypes.filter((h: string) => h !== hazard)
        : [...prev.hazardTypes, hazard],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="hazard-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                Generated Report
              </h2>
              <p className="text-sm text-neutral-600">
                Review and finalize the auto-generated report
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
          >
            Back
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between mb-2">
            {selectedLocationLabel && (
              <div className="text-sm text-neutral-600">
                Report for:{" "}
                <span className="font-medium">{selectedLocationLabel}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Report Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Report Type *
              </label>
              <select
                value={formData.reportType}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    reportType: e.target.value as ReportType,
                  }))
                }
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    priority: e.target.value as Priority,
                  }))
                }
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">
                  Urgent - Immediate Action Required
                </option>
              </select>
              <div
                className={`mt-2 px-2 py-1 text-xs font-medium rounded-full border inline-block ${getPriorityColor(
                  formData.priority
                )}`}
              >
                {formData.priority.charAt(0).toUpperCase() +
                  formData.priority.slice(1)}{" "}
                Priority
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confidence Level
              </label>
              <select
                value={formData.confidenceLevel}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    confidenceLevel: e.target.value as ConfidenceLevel,
                  }))
                }
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="low">Low Confidence (60-70%)</option>
                <option value="medium">Medium Confidence (70-85%)</option>
                <option value="high">High Confidence (85%+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Valid Until
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      validUntil: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Affected Regions *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => handleRegionToggle(region)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    formData.affectedRegions.includes(region)
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : "card-bg text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Hazard Types *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {hazardTypes.map((hazard) => (
                <button
                  key={hazard}
                  type="button"
                  onClick={() => handleHazardToggle(hazard)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    formData.hazardTypes.includes(hazard)
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "card-bg text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {hazard}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Executive Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  summary: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Detailed Analysis *
            </label>
            <textarea
              value={formData.detailedAnalysis}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  detailedAnalysis: e.target.value,
                }))
              }
              rows={8}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Data Sources & Methodology
            </label>
            <textarea
              value={formData.dataSource}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  dataSource: e.target.value,
                }))
              }
              rows={6}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Recommendations & Actions *
            </label>
            <textarea
              value={formData.recommendations}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  recommendations: e.target.value,
                }))
              }
              rows={6}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <div className="flex items-center space-x-2 text-sm text-neutral-600">
              <span>Report will be timestamped and logged</span>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-blue-500 text-white py-3 px-8 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Finish Report & Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratedReportForm;
