import type { HazardReport } from "@weather/types";
import { AlertTriangle, CheckCircle2, Clock, MapPin, MessageCircle, ThumbsUp } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "../../../contexts/LocationContext";
import { formatDate, hazardTypeLabels, severityColors } from "../../../utils";
import ReportDetailModal from "./ReportDetailModal";

interface AllReportsPageProps {
  reports: HazardReport[];
  isLoading: boolean;
  onBack: () => void;
}

interface CustomWindow extends Window {
  navigateTo?: (page: string) => void;
}

const AllReportsPage: React.FC<AllReportsPageProps> = ({ reports, isLoading, onBack }) => {
  const { t } = useTranslation(["reports", "common", "dashboard"]);
  const { selectedLocation } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);

  // Helper function to translate hazard types
  const translateHazardType = (hazardType: string) => {
    const translationKey = `common:hazardTypes.${hazardType}`;
    const translated = t(translationKey);

    return translated === translationKey
      ? hazardTypeLabels[hazardType as keyof typeof hazardTypeLabels] || hazardType
      : translated;
  };

  // Helper function to translate severity levels
  const translateSeverity = (severity: string) => {
    const translationKey = `dashboard:riskLevels.${severity}`;
    const translated = t(translationKey);

    return translated === translationKey
      ? severity.charAt(0).toUpperCase() + severity.slice(1)
      : translated;
  };
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">{t("reports:allReports")}</h2>
        <p className="text-neutral-600">{t("common:loading.default")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="hazard-card bg-white text-neutral-900 p-6 text-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            {selectedLocation
              ? t("reports:allReportsIn", { location: selectedLocation })
              : t("reports:allReports")}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
            >
              {t("common:back")}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border border-neutral-200 rounded-lg bg-white text-neutral-900 hover:bg-neutral-50 hover:shadow-md hover:-translate-y-0.5 hover:border-sky-700 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-3">
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

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {translateHazardType(report.type)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          (severityColors as unknown as Record<string, string>)[report.severity] ||
                          "text-neutral-700 bg-neutral-100 border-neutral-200"
                        }`}
                      >
                        {translateSeverity(report.severity)}
                      </span>
                      {report.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-neutral-600">{report.description}</p>
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

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{report.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{report.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onViewFull={(id) => {
            setSelectedReport(null);
            // Navigate to a dedicated detail page using the app\'s page router
            const nav = (window as CustomWindow).navigateTo;
            if (typeof nav === "function") nav(`report-detail:${id}`);
          }}
        />
      )}
    </div>
  );
};

export default AllReportsPage;
