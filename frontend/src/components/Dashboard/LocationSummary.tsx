import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "../../contexts/LocationContext";
import { useData } from "../../contexts/DataContext";

export const LocationSummary: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { t } = useTranslation(["dashboard", "common"]);
  const { selectedLocation } = useLocation();
  const { getLocationInsights, getLocationDetails } = useData();

  const title = selectedLocation.split(",")[0] || selectedLocation;
  const insights = getLocationInsights(selectedLocation || title);
  const locationDetails = getLocationDetails(title);

  // Helper function to translate action items
  const translateAction = (action: string) => {
    // Direct mapping of known action strings to translation keys
    const actionMappings: Record<string, string> = {
      "Evacuate low-lying areas immediately":
        "dashboard:actions.evacuatelowlyingareasimmediately",
      "Follow directives from local authorities and disaster response teams":
        "dashboard:actions.followdirectivesfromlocalauthoritiesanddisasterresponseteams",
      "Avoid coastal access and small craft operations":
        "dashboard:actions.avoidcoastalaccessandsmallcraftoperations",
      "Monitor official advisories and stay tuned to local news":
        "dashboard:actions.monitorofficialadvisoriesandstaytunedtolocalnews",
      "Exercise caution near the shoreline":
        "dashboard:actions.exercisecautionneartheshoreline",
      "Secure loose outdoor items and vessels":
        "dashboard:actions.securelooseoutdooritemsandvessels",
      "No immediate action; stay informed":
        "dashboard:actions.noimmediateactionstayinformed",
      // Additional mappings for other possible action strings (with periods)
      "Avoid shoreline and beaches until official all-clear.":
        "dashboard:actions.avoidshorelineandbeachesuntilofficialallclear",
      "Follow municipal advisories and do not attempt to cross flooded roads.":
        "dashboard:actions.followmunicipaladvisoriesanddonotattempttocrossfloodedroads",
      "Secure small craft and move vehicles to higher ground.":
        "dashboard:actions.securesmallcraftandmovevehiclestohigherground",
      // Also include versions without periods for backward compatibility
      "Avoid shoreline and beaches until official all-clear":
        "dashboard:actions.avoidshorelineandbeachesuntilofficialallclear",
      "Follow municipal advisories and do not attempt to cross flooded roads":
        "dashboard:actions.followmunicipaladvisoriesanddonotattempttocrossfloodedroads",
      "Secure small craft and move vehicles to higher ground":
        "dashboard:actions.securesmallcraftandmovevehiclestohigherground",
    };

    const translationKey = actionMappings[action];
    if (translationKey) {
      const translated = t(translationKey);
      return translated === translationKey ? action : translated;
    }
    return action;
  };

  // Helper function to translate hazard types
  const translateHazardType = (hazardType: string) => {
    const translationKey = `common:hazardTypes.${hazardType}`;
    const translated = t(translationKey);

    // If translation is the same as key, return formatted original
    return translated === translationKey
      ? hazardType.replace(/_/g, " ")
      : translated;
  };

  const riskColor = {
    low: "text-green-700 bg-green-50 border-green-200",
    medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
    high: "text-orange-700 bg-orange-50 border-orange-200",
    critical: "text-red-700 bg-red-50 border-red-200",
  } as const;

  return (
    <div className={`hazard-card p-8 ${className || "w-full"}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">
            {title}
          </h1>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div
            className={`px-3 py-1.5 text-sm font-medium rounded-full border ${
              riskColor[insights.riskLevel]
            }`}
          >
            {t(`dashboard:riskLevels.${insights.riskLevel}`)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">
            {t("dashboard:summary")}
          </h3>
          <p className="text-neutral-700 mt-2">
            {(locationDetails?.headline && (
              <strong className="block text-neutral-900">
                {locationDetails?.headline}
              </strong>
            )) ||
              null}
            {locationDetails?.summary ||
              (insights.topHazard
                ? t("dashboard:primaryHazard", {
                    hazard: translateHazardType(insights.topHazard),
                  })
                : t("dashboard:noDominantHazard"))}{" "}
            {locationDetails
              ? null
              : insights.nearbyReportCount > 0
                ? t("dashboard:recentReportsCount", {
                    count: insights.nearbyReportCount,
                  })
                : t("dashboard:noCitizenReports")}
          </p>

          <h4 className="mt-4 font-semibold">
            {t("dashboard:recommendedActions")}
          </h4>
          <ul className="list-disc list-inside text-sm text-neutral-700 mt-2">
            {(locationDetails?.actions || insights.recommendedActions).map(
              (a, i) => (
                <li key={i}>{translateAction(a)}</li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
