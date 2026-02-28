import type { DashboardStats as StatsType } from "@weather/types";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RollingStatsProps {
  stats: StatsType;
  isLoading: boolean;
  className?: string;
}

export const RollingStats: React.FC<RollingStatsProps> = ({ stats, isLoading, className }) => {
  const { t } = useTranslation("dashboard");
  const [displayedStats, setDisplayedStats] = useState<StatsType | null>(null);
  const [previousStats, setPreviousStats] = useState<StatsType | null>(null);

  useEffect(() => {
    if (stats && !displayedStats) {
      setDisplayedStats(stats);
      setPreviousStats(stats);
    }

    const interval = setInterval(() => {
      setPreviousStats(displayedStats);
      setDisplayedStats(stats);
    }, 60000);

    return () => clearInterval(interval);
  }, [stats, displayedStats]);

  if (isLoading || !displayedStats || !previousStats) {
    return (
      <div className={`overflow-hidden py-1 stats-strip-background ${className || ""}`}>
        <div className="flex w-max animate-roll">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center py-0.5 px-4 mr-4 bg-white rounded-md shadow-xs loading-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded-sm w-1/4"></div>
              <div className="h-4 bg-neutral-200 rounded-sm w-1/2 ml-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t("totalReports"),
      value: displayedStats.totalReports,
      previousValue: previousStats.totalReports,
      recentChange: displayedStats.recentActivity.newReports,
      icon: MessageSquare,
      color: "text-sky-600",
    },
    {
      title: t("verifiedReports"),
      value: displayedStats.verifiedReports,
      previousValue: previousStats.verifiedReports,
      recentChange: displayedStats.recentActivity.newVerifications,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: t("activeHazards"),
      value: displayedStats.activeHazards,
      previousValue: previousStats.activeHazards,
      recentChange: displayedStats.recentActivity.newHazards,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: t("socialMentions"),
      value: displayedStats.socialMediaMentions,
      previousValue: previousStats.socialMediaMentions,
      recentChange: displayedStats.recentActivity.newMentions,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className={`overflow-hidden py-1 stats-strip-background border-b ${className || ""}`}>
      <div className="flex w-max animate-roll">
        {statCards.map((stat, index) => {
          const valueChanged = stat.value !== stat.previousValue;
          const change = stat.recentChange;

          return (
            <div
              key={index}
              className="flex items-center py-0.5 px-4 mr-3 bg-white rounded-md shadow-xs whitespace-nowrap"
            >
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <p className="text-xs font-normal text-neutral-500 ml-2">{stat.title}</p>
              <p className="text-sm font-semibold text-neutral-800 ml-2">{stat.value}</p>
              {valueChanged && change > 0 ? (
                <div className="flex items-center text-green-500 ml-2">
                  <ArrowUp className="h-2.5 w-2.5" />
                  <span className="text-xs font-normal">{change}</span>
                </div>
              ) : valueChanged && change < 0 ? (
                <div className="flex items-center text-red-500 ml-2">
                  <ArrowDown className="h-2.5 w-2.5" />
                  <span className="text-xs font-normal">{Math.abs(change)}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
