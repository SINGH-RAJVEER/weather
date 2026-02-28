import type { PublicAdvisory } from "@weather/types";
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import React from "react";
import { useData } from "../../contexts/DataContext";
import { useLocation } from "../../contexts/LocationContext";
import { Button } from "../ui/button";

const severityAccent: Record<PublicAdvisory["severityLevel"], string> = {
  info: "#04c4d9",
  warning: "#f59e0b",
  emergency: "#ef4444",
};

const SeverityIcon: React.FC<{ level: PublicAdvisory["severityLevel"] }> = ({ level }) => {
  if (level === "emergency") return <ShieldAlert className="h-5 w-5" />;
  if (level === "warning") return <AlertTriangle className="h-5 w-5" />;
  return <Info className="h-5 w-5" />;
};

export const PSABanner: React.FC = () => {
  const { selectedLocation } = useLocation();
  const { getAdvisoriesForLocation } = useData();
  const [open, setOpen] = React.useState(false);

  const advisories = getAdvisoriesForLocation(selectedLocation);
  const top = advisories[0];

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Focus the modal when it opens
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!advisories.length) return null;

  return (
    <div
      className="hazard-card p-0 mb-8 relative overflow-hidden"
      role="region"
      aria-label="Public safety advisory for your location"
    >
      {/* Left severity accent bar */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: severityAccent[top.severityLevel] }}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {/* Icon with tinted circle */}
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${severityAccent[top.severityLevel]}20`, // tint
              color: severityAccent[top.severityLevel],
            }}
          >
            <SeverityIcon level={top.severityLevel} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-extrabold text-[15px] leading-tight truncate">{top.title}</h3>
              <span className="text-xs text-neutral-600">
                Issued by {top.issuedBy} · {new Date(top.issuedAt).toLocaleString()}
              </span>
            </div>

            {/* Clamp with subtle fade */}
            <div className="relative mt-2">
              <div
                className="text-sm leading-relaxed pr-2"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {top.content}
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
                style={{
                  background: "linear-gradient(to top, var(--card-bg), rgba(244,248,251,0))",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0 flex justify-start sm:justify-end items-center">
            <Button
              onClick={() => setOpen(true)}
              className="px-3 py-1.5 text-sm"
              variant="secondary"
            >
              View details
            </Button>
          </div>
        </div>

        {/* Optional small caption for additional advisories */}
        {advisories.length > 1 && (
          <div className="mt-2 ml-[52px] text-[11px] text-neutral-600">
            {advisories.length - 1} more advisory(s) for your region
          </div>
        )}
      </div>

      {/* Modal for full details */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 sm:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisory-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white text-neutral-900 rounded-xl border shadow-lg p-0 max-h-[90vh] overflow-hidden w-[95vw] sm:w-full max-w-2xl flex flex-col"
            onClick={stop}
            tabIndex={-1}
          >
            <div className="p-5 pb-3 border-b flex items-start justify-between gap-3 sticky top-0 bg-white z-[1] rounded-t-xl">
              <div>
                <div className="flex flex-col space-y-2 text-left">
                  <h2
                    id="advisory-modal-title"
                    className="text-lg font-semibold text-foreground flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center">
                      <SeverityIcon level={top.severityLevel} />
                    </div>
                    <span>{top.title}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Issued by {top.issuedBy} · {new Date(top.issuedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="h-8 w-8 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-auto">
              <section>
                <h4 className="font-semibold mb-1">Advisory</h4>
                <p className="whitespace-pre-wrap leading-relaxed">{top.content}</p>
              </section>

              {top.targetRegions?.length ? (
                <section>
                  <h4 className="font-semibold mb-1">Target regions</h4>
                  <div className="flex flex-wrap gap-2">
                    {top.targetRegions.map((r) => (
                      <span
                        key={r}
                        className="inline-block text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {advisories.length > 1 && (
                <section>
                  <h4 className="font-semibold mb-2">Other advisories</h4>
                  <ul className="space-y-3">
                    {advisories.slice(1).map((a) => (
                      <li key={a.id} className="border rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: severityAccent[a.severityLevel],
                            }}
                          />
                          <div className="font-semibold text-sm">{a.title}</div>
                          <span className="text-[11px] text-neutral-500">
                            {new Date(a.issuedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {a.content}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PSABanner;
