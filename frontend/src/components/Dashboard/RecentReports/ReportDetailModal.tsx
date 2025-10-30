import React, { useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  AlertTriangle,
  ThumbsUp,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { HazardReport } from "../../../types/types";
import { formatDate, hazardTypeLabels, severityColors } from "../../../utils";
import { useTranslation } from "react-i18next";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface ReportDetailModalProps {
  report: HazardReport;
  onClose: () => void;
  onViewFull?: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onViewFull,
}) => {
  const { t } = useTranslation(["reports", "common"]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const hazardLabel =
    t(`common:hazardTypes.${report.type}`, {
      defaultValue: hazardTypeLabels[report.type] || report.type,
    }) || report.type;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-full relative flex flex-col"
        onClick={stop}
      >
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200 text-neutral-600 hover:text-neutral-800"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 overflow-y-auto">
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
              <h2
                id="report-modal-title"
                className="text-xl font-semibold text-neutral-900"
              >
                {hazardLabel}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${
                    severityColors[report.severity]
                  }`}
                >
                  {t(`reports:severity.${report.severity}`, {
                    defaultValue:
                      report.severity.charAt(0).toUpperCase() +
                      report.severity.slice(1),
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

          {report.media && report.media.length > 0 && (
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {report.media.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-lg">
                          <img
                            src={url}
                            alt={`report image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 p-2 rounded-full" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 p-2 rounded-full" />
            </Carousel>
          )}

          {!report.media || report.media.length === 0 ? (
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-md px-2 py-1">
                {/* small empty image placeholder icon using a box */}
                <span
                  className="inline-block h-3.5 w-4 rounded-sm bg-neutral-200 border border-neutral-300"
                  aria-hidden
                />
                <span>{t("reports:noPhotos")}</span>
              </div>
            </div>
          ) : null}

          <p className="text-neutral-700 mb-6 whitespace-pre-line">
            {report.description}
          </p>

          <div className="flex items-center justify-between text-sm text-neutral-600 border-t border-neutral-200 pt-4">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {report.location.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatDate(report.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 mr-2">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" /> {report.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {report.comments}
                </span>
              </div>
              {onViewFull && (
                <button
                  type="button"
                  onClick={() => onViewFull(report.id)}
                  className="px-3 py-1.5 rounded-md bg-sky-600 text-white text-xs sm:text-sm hover:bg-sky-700"
                >
                  {t("reports:viewFullDetails")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
