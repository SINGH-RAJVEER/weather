import type { AnalystReport } from "@weather/types";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AnalystReportPayload {
  analystId: string;
  analystName: string;
  title: string;
  summary: string;
  details?: string;
  relatedHazards?: string[];
  recommendations?: string;
  attachments?: string[];
}

export const saveAnalystReport = async (payload: AnalystReportPayload) => {
  const res = await axios.post(`${API_URL}/api/analyst-reports`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const getAnalystReports = async (): Promise<AnalystReport[]> => {
  const response = await fetch(`${API_URL}/analyst-reports`);
  if (!response.ok) {
    throw new Error("Failed to fetch analyst reports");
  }
  return response.json();
};

export const getApprovedAnalystReports = async (): Promise<AnalystReport[]> => {
  const response = await fetch(`${API_URL}/analyst-reports/approved`);
  if (!response.ok) {
    throw new Error("Failed to fetch approved analyst reports");
  }
  return response.json();
};
