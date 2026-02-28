import axios from "axios";
import "dotenv/config";
import type { AnalystReport } from "@weather/types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

interface FileAttachment {
  uri: string;
  name?: string;
  mimeType?: string;
}

interface AnalystReportPayload extends Partial<Omit<AnalystReport, "id" | "attachments">> {
  attachments?: FileAttachment[];
  [key: string]: unknown;
}

const saveAnalystReport = async (payload: AnalystReportPayload): Promise<AnalystReport> => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    if (key !== "attachments") {
      formData.append(key, payload[key as keyof AnalystReportPayload]);
    }
  });

  if (payload.attachments && payload.attachments.length > 0) {
    payload.attachments.forEach((file, index) => {
      formData.append("attachments", {
        uri: file.uri,
        name: file.name || `file_${index}.pdf`,
        type: file.mimeType || "application/octet-stream",
      });
    });
  }

  const res = await axios.post<AnalystReport>(`${API_BASE_URL}/api/analyst-reports`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export default saveAnalystReport;
