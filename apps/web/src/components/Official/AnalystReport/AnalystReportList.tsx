import type { AnalystReport } from "@weather/types";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  FileText,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import type React from "react";
import { formatDate } from "../../../utils";

interface AnalystReportListProps {
  reports: AnalystReport[];
  onSelectReport: (report: AnalystReport) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
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

export const AnalystReportList: React.FC<AnalystReportListProps> = ({
  reports,
  onSelectReport,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Analyst Reports</h2>
            <p className="text-sm text-neutral-200">Review and approve reports from analysts</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="hazard-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-neutral-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
              </select>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => {
          const ReportIcon = getReportTypeIcon(report.reportType);
          return (
            <div
              key={report.id}
              className="hazard-card hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onSelectReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <ReportIcon className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 text-xs text-neutral-500 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(report.submittedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 truncate">
                        {report.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                          report.priority
                        )}`}
                      >
                        {report.priority.toUpperCase()}
                      </span>
                      {/* Removed approved tab/status from report card */}
                    </div>

                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{report.summary}</p>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{report.analyst}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{report.affectedRegions.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reports.length === 0 && (
        <div className="hazard-card text-center py-12">
          <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">No reports found matching your criteria</p>
        </div>
      )}
    </div>
  );
};
