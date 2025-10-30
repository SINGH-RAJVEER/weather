import React, { useState, useEffect } from "react";
import { FileText, Send, Loader } from "lucide-react";
import { AnalystReport } from "./OfficialReportsView";
import { useAuth } from "../../contexts/AuthContext"; // Assuming useAuth is available
import { formatDate } from "../../utils"; // Assuming formatDate is available

interface IssueAdvisoryPageProps {
  reportData: AnalystReport | null;
  onBack: () => void;
}

const IssueAdvisoryPage: React.FC<IssueAdvisoryPageProps> = ({
  reportData,
  onBack,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [severityLevel, setSeverityLevel] = useState<
    "info" | "warning" | "emergency"
  >("info");
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [validUntil, setValidUntil] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (reportData) {
      // Pre-fill logic based on reportData
      setTitle(`Advisory: ${reportData.title}`);
      setContent(
        `Based on the analyst report (ID: ${reportData.id}), "${reportData.summary}".\n\nDetailed analysis: ${reportData.detailedAnalysis}\n\nRecommendations: ${reportData.recommendations}`
      );
      setTargetRegions(reportData.affectedRegions);
      // Set severity based on report priority
      if (reportData.priority === "urgent") {
        setSeverityLevel("emergency");
      } else if (reportData.priority === "high") {
        setSeverityLevel("warning");
      } else {
        setSeverityLevel("info");
      }
      // Set validUntil based on report validUntil, if available
      if (reportData.validUntil) {
        setValidUntil(reportData.validUntil.substring(0, 16)); // Format for datetime-local input
      }
    }
  }, [reportData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitMessage("Error: User not authenticated.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    const advisoryData = {
      title,
      content,
      issuedBy: user.name, // Or user.id, depending on what's stored
      status: "published", // Default to published on submission
      targetRegions,
      severityLevel,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      relatedReportId: reportData?.id,
      // Attachments would need a separate upload mechanism to a real storage service
      // For now, we'll just pass the file names or mock URLs
      attachments: attachments.map((file) => file.name), // Mocking attachment URLs
    };

    try {
      const response = await fetch("/api/advisories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(advisoryData),
      });

      if (response.ok) {
        setSubmitMessage("Advisory issued successfully!");
        // Optionally clear form or navigate back
        // setTitle(""); setContent(""); etc.
        setTimeout(onBack, 2000); // Go back after 2 seconds
      } else {
        const errorData = await response.json();
        setSubmitMessage(
          `Error issuing advisory: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      setSubmitMessage(
        `Network error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <div className="hazard-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <FileText className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Issue Public Advisory
          </h2>
          <p className="text-sm text-neutral-600">
            Create and disseminate official public advisory
          </p>
        </div>
      </div>

      {reportData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">Advisory linked to report:</p>
          <p>
            <strong>ID:</strong> {reportData.id}
          </p>
          <p>
            <strong>Title:</strong> {reportData.title}
          </p>
          <p>
            <strong>Analyst:</strong> {reportData.analyst}
          </p>
          <p>
            <strong>Submitted:</strong> {formatDate(reportData.submittedAt)}
          </p>
          <p>
            <strong>Affected Regions:</strong>{" "}
            {reportData.affectedRegions.join(", ")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Advisory Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
            placeholder="Enter advisory title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Advisory Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 resize-y"
            rows={8}
            placeholder="Enter detailed advisory content..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Severity Level
            </label>
            <select
              value={severityLevel}
              onChange={(e) =>
                setSeverityLevel(
                  e.target.value as "info" | "warning" | "emergency"
                )
              }
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
            >
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Target Regions
            </label>
            <input
              type="text"
              value={targetRegions.join(", ")}
              onChange={(e) =>
                setTargetRegions(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s)
                )
              }
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
              placeholder="Enter target regions (comma separated)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Valid Until
          </label>
          <input
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Attachments
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
          {attachments.length > 0 && (
            <div className="mt-2 text-sm text-neutral-600">
              Selected files: {attachments.map((file) => file.name).join(", ")}
            </div>
          )}
        </div>

        {submitMessage && (
          <div
            className={`p-3 rounded-lg text-sm ${
              submitMessage.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {submitMessage}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Issuing...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Issue Advisory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueAdvisoryPage;
