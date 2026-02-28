import type { Comment, HazardReport } from "@weather/types";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  MessageCircle,
  Minimize2,
  ThumbsUp,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMockCommentsForReport } from "@/utils/commentGenerator";
import { formatDate, hazardTypeLabels, severityColors } from "../../../utils";

interface ReportDetailPageProps {
  report: HazardReport | null;
  onBack: () => void;
}

const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ report, onBack }) => {
  const { t } = useTranslation(["reports", "common"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fillMode, setFillMode] = useState<"fit" | "fill">("fit");
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLightbox) setShowLightbox(false);
        else onBack();
        return;
      }
      if (showLightbox && report?.media && report.media.length > 1) {
        if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % report.media!.length);
        if (e.key === "ArrowLeft")
          setCurrentIndex((i) => (i - 1 + report.media!.length) % report.media!.length);
      }
      if (showLightbox && e.key.toLowerCase() === "z") {
        setFillMode((m) => (m === "fit" ? "fill" : "fit"));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [report, onBack, showLightbox]);

  if (!report) {
    return (
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5" /> {t("common:back")}
        </button>
        <div className="rounded-lg border border-neutral-200 bg-white/5 p-6">
          <p className="text-neutral-200">Report not found.</p>
        </div>
      </div>
    );
  }

  const hazardLabel =
    t(`common:hazardTypes.${report.type}`, {
      defaultValue: hazardTypeLabels[report.type] || report.type,
    }) || report.type;
  const comments: Comment[] = getMockCommentsForReport({
    id: report.id,
    timestamp: report.timestamp,
    type: report.type,
  });

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
          <div className="p-6 relative">
            <button
              onClick={onBack}
              className="absolute top-4 right-4 px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
            >
              {t("common:back")}
            </button>
            <div className="flex items-start gap-3 mb-4">
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
                  className={`h-5 w-5 ${
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
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold text-neutral-900">{hazardLabel}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      severityColors[report.severity]
                    }`}
                  >
                    {t(`reports:severity.${report.severity}`, {
                      defaultValue:
                        report.severity.charAt(0).toUpperCase() + report.severity.slice(1),
                    })}
                  </span>
                  {report.verified && (
                    <span
                      className="inline-flex items-center gap-1 text-green-600 text-xs"
                      title={t("reports:verified")}
                    >
                      <CheckCircle2 className="h-4 w-4" /> {t("reports:verified")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Media grid (Twitter-like) */}
            {report.media && report.media.length > 0 && (
              <div className="mb-6">
                {report.media.length === 1 && (
                  <div className="rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="relative w-full h-64 sm:h-96 bg-neutral-200 cursor-pointer img-hover-overlay"
                      onClick={() => {
                        setCurrentIndex(0);
                        setShowLightbox(true);
                      }}
                      aria-label="Open image"
                    >
                      <img
                        src={report.media[0]}
                        alt="report media"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  </div>
                )}

                {report.media.length === 2 && (
                  <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                    {report.media.slice(0, 2).map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="relative w-full h-64 sm:h-80 bg-neutral-200 cursor-pointer img-hover-overlay"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowLightbox(true);
                        }}
                        aria-label={`Open image ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`report media ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {report.media.length === 3 && (
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden h-64 sm:h-96">
                    <button
                      type="button"
                      className="relative w-full h-full bg-neutral-200 row-span-2 cursor-pointer img-hover-overlay"
                      onClick={() => {
                        setCurrentIndex(0);
                        setShowLightbox(true);
                      }}
                      aria-label="Open image 1"
                    >
                      <img
                        src={report.media[0]}
                        alt="report media 1"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                    {report.media.slice(1, 3).map((url, idx) => (
                      <button
                        key={idx + 1}
                        type="button"
                        className="relative w-full h-full bg-neutral-200 cursor-pointer img-hover-overlay"
                        onClick={() => {
                          setCurrentIndex(idx + 1);
                          setShowLightbox(true);
                        }}
                        aria-label={`Open image ${idx + 2}`}
                      >
                        <img
                          src={url}
                          alt={`report media ${idx + 2}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {report.media.length >= 4 && (
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden h-64 sm:h-96">
                    {report.media.slice(0, 4).map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="relative w-full h-full bg-neutral-200 cursor-pointer img-hover-overlay"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowLightbox(true);
                        }}
                        aria-label={`Open image ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`report media ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {idx === 3 && (report.media?.length ?? 0) > 4 && (
                          <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-lg font-semibold">
                            +{(report.media?.length ?? 0) - 4}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!report.media || report.media.length === 0 ? (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-sm text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-md px-2.5 py-1.5">
                  <span
                    className="inline-block h-4 w-5 rounded-sm bg-neutral-200 border border-neutral-300"
                    aria-hidden
                  />
                  <span>{t("reports:noPhotos")}</span>
                </div>
              </div>
            ) : null}

            <div className="prose max-w-none">
              <p className="text-neutral-700 whitespace-pre-line">{report.description}</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-700 gap-3">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {report.location.address}
                </span>
                <span className="hidden sm:inline text-neutral-300">•</span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {formatDate(report.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" /> {report.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {comments.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Comments shown only on detailed page */}
      <div className="max-w-5xl mx-auto mt-4">
        <div className="bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-neutral-500" />
              {t("reports:commentsHeader", { count: comments.length })}
            </h3>
            {comments.length === 0 ? (
              <p className="text-sm text-neutral-600">{t("reports:noCommentsYet")}</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-semibold">
                      {c.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-900">{c.author}</span>
                        <span>•</span>
                        <span>{formatDate(c.timestamp)}</span>
                      </div>
                      <p className="text-sm text-neutral-800 mt-0.5 whitespace-pre-line">
                        {c.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {showLightbox && report.media && report.media.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setShowLightbox(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center w-full h-[60vh] sm:h-[70vh]">
              <img
                src={report.media[currentIndex]}
                alt={`report media ${currentIndex + 1}`}
                className={
                  fillMode === "fill"
                    ? "w-full h-full object-cover"
                    : "max-w-full max-h-full object-contain"
                }
              />
            </div>
            {report.media.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                  onClick={() =>
                    setCurrentIndex((i) => (i - 1 + report.media!.length) % report.media!.length)
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                  onClick={() => setCurrentIndex((i) => (i + 1) % report.media!.length)}
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">
                  {currentIndex + 1} / {report.media.length}
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setFillMode((m) => (m === "fit" ? "fill" : "fit"))}
              className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 text-white rounded-full px-2.5 py-1 flex items-center gap-1 text-xs"
              title={fillMode === "fit" ? "Fill (crop)" : "Fit (no crop)"}
              aria-label={fillMode === "fit" ? "Fill image" : "Fit image"}
            >
              {fillMode === "fit" ? (
                <>
                  <Maximize2 className="h-3.5 w-3.5" /> Fill
                </>
              ) : (
                <>
                  <Minimize2 className="h-3.5 w-3.5" /> Fit
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportDetailPage;
