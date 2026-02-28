import type { AnalystReport } from "@weather/types";
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileText,
  MapPin,
  TrendingUp,
  User,
} from "lucide-react";
import type React from "react";
import { formatDate } from "../../../utils";

interface AnalystReportDetailProps {
  report: AnalystReport;
  onBack: () => void;
  setAdvisoryReportData: (report: AnalystReport | null) => void;
  setCurrentPage: (page: string) => void;
}

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

const getReportTypeIcon = (type: string) => {
  switch (type) {
    case "emergency_alert":
      return AlertTriangle;
    case "risk_assessment":
      return BarChart3;
    case "forecast_update":
      return TrendingUp;
    default:
      return FileText;
  }
};

export const AnalystReportDetail: React.FC<AnalystReportDetailProps> = ({
  report,
  onBack,
  setAdvisoryReportData,
  setCurrentPage,
}) => {
  const ReportIcon = getReportTypeIcon(report.reportType);

  return (
    <div className="space-y-6">
      <div className="hazard-card">
        {/* Report Header */}
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ReportIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-neutral-900">{report.title}</h1>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(
                      report.priority
                    )}`}
                  >
                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">
                  Report ID: {report.id}{" "}
                  <span className="ml-4 text-xs text-neutral-500">
                    Submitted: {formatDate(report.submittedAt)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onBack}
                className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
              >
                Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-600">Analyst:</span>
              <span className="font-medium">{report.analyst}</span>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Executive Summary</h3>
            <p className="text-neutral-700 leading-relaxed">{report.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Affected Regions</h3>
            <div className="flex flex-wrap gap-2">
              {report.affectedRegions.map((region) => (
                <span
                  key={region}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{region}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Hazard Types</h3>
            <div className="flex flex-wrap gap-2">
              {report.hazardTypes.map((hazard) => (
                <span
                  key={hazard}
                  className="flex items-center space-x-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>{hazard}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Detailed Analysis</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {report.detailedAnalysis}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              {report.reviewedBy && (
                <p>
                  Reviewed by: <span className="font-medium">{report.reviewedBy}</span> on{" "}
                  {formatDate(report.reviewedAt!)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        <button
          onClick={() => {
            setAdvisoryReportData(report);
            setCurrentPage("issue-advisory");
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
        >
          <FileText className="h-4 w-4" />
          <span>Issue Advisory</span>
        </button>
        <button className="flex items-center space-x-2 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200 shadow-md">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>
    </div>
  );
};
