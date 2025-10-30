import React, { useState, useEffect } from "react";
import { AnalystReport } from "../../types/types";
import { AnalystReportList } from "./AnalystReport/AnalystReportList";
import { AnalystReportDetail } from "./AnalystReport/AnalystReportDetail";
import { getApprovedAnalystReports } from "../../api/analystReport";

interface OfficialReportsViewProps {
  setAdvisoryReportData: (report: AnalystReport | null) => void;
  setCurrentPage: (page: string) => void;
}

export const OfficialReportsView: React.FC<OfficialReportsViewProps> = ({
  setAdvisoryReportData,
  setCurrentPage,
}) => {
  const [selectedReport, setSelectedReport] = useState<AnalystReport | null>(
    null
  );
  const [reports, setReports] = useState<AnalystReport[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const approvedReports = await getApprovedAnalystReports();
        setReports(approvedReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesPriority =
      filterPriority === "all" || report.priority === filterPriority;
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.analyst.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  if (selectedReport) {
    return (
      <AnalystReportDetail
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        setAdvisoryReportData={setAdvisoryReportData}
        setCurrentPage={setCurrentPage}
      />
    );
  }

  return (
    <AnalystReportList
      reports={filteredReports}
      onSelectReport={setSelectedReport}
      filterPriority={filterPriority}
      setFilterPriority={setFilterPriority}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};
