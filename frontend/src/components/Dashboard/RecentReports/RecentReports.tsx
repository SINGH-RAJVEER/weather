import React, { useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { HazardReport } from "../../../types/types";
import ReportDetailModal from "./ReportDetailModal";
import { formatDate, hazardTypeLabels, severityColors } from "../../../utils";

interface RecentReportsProps {
  reports: HazardReport[];
  isLoading: boolean;
  className?: string;
  onNavigate?: (page: string) => void;
}

interface CustomWindow extends Window {
  navigateTo?: (page: string) => void;
}

export const RecentReports: React.FC<RecentReportsProps> = ({
  reports,
  isLoading,
  className,
  onNavigate,
}) => {
  const { t } = useTranslation(["reports", "common", "dashboard"]);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(
    null
  );

  // Helper function to translate hazard types
  const translateHazardType = (hazardType: string) => {
    const translationKey = `common:hazardTypes.${hazardType}`;
    const translated = t(translationKey);

    // If translation is the same as key, fallback to hazardTypeLabels
    return translated === translationKey
      ? hazardTypeLabels[hazardType as keyof typeof hazardTypeLabels] ||
          hazardType
      : translated;
  };

  // Helper function to translate severity levels
  const translateSeverity = (severity: string) => {
    const translationKey = `dashboard:riskLevels.${severity}`;
    const translated = t(translationKey);

    // If translation is the same as key, fallback to capitalized original
    return translated === translationKey
      ? severity.charAt(0).toUpperCase() + severity.slice(1)
      : translated;
  };
  if (isLoading) {
    return (
      <div className={`hazard-card ${className || ""}`}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {t("reports:recentReports")}
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 border border-neutral-200 rounded-lg loading-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded-sm mb-2"></div>
              <div className="h-3 bg-neutral-200 rounded-sm w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const recentReports = reports;

  return (
    <div className={`hazard-card h-full ${className || ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          {t("reports:recentReports")}
        </h3>
        <button
          className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
          onClick={() => {
            if (onNavigate) return onNavigate("recent-reports");
            // fallback - use global navigate shim
            const nav = (window as CustomWindow).navigateTo;
            if (typeof nav === "function") nav("recent-reports");
          }}
        >
          {t("common:viewAll")}
        </button>
      </div>

      <div className="space-y-4">
        {recentReports.map((report) => (
          <div
            key={report.id}
            className="p-5 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:shadow-md hover:-translate-y-0.5 hover:border-sky-700 transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div
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
                    className={`h-4 w-4 ${
                      report.severity === "critical"
                        ? "text-red-600"
                        : report.severity === "high"
                        ? "text-orange-600"
                        : report.severity === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-neutral-900">
                      {translateHazardType(report.type)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        severityColors[report.severity]
                      }`}
                    >
                      {translateSeverity(report.severity)}
                    </span>
                    {report.verified && (
                      <div title={t("reports:verified")}>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{report.location.address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(report.timestamp)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center space-x-1 bg-transparent border-none cursor-pointer text-neutral-500 hover:text-sky-600 transition-colors duration-200"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{report.likes}</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center space-x-1 bg-transparent border-none cursor-pointer text-neutral-500 hover:text-sky-600 transition-colors duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{report.comments}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onViewFull={(id) => {
            setSelectedReport(null);
            if (onNavigate) return onNavigate(`report-detail:${id}`);
            const nav = (window as CustomWindow).navigateTo;
            if (typeof nav === "function") nav(`report-detail:${id}`);
          }}
        />
      )}
    </div>
  );
};
