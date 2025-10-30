import axios from "axios";
import "dotenv/config";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const saveAnalystReport = async (payload) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    if (key !== "attachments") {
      formData.append(key, payload[key]);
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

  const res = await axios.post(
    `${API_BASE_URL}/api/analyst-reports`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export default saveAnalystReport;
