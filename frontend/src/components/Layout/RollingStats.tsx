
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardStats as StatsType } from "../../types/types";

interface RollingStatsProps {
  stats: StatsType;
  isLoading: boolean;
  className?: string;
}

export const RollingStats: React.FC<RollingStatsProps> = ({
  stats,
  isLoading,
  className,
}) => {
  const { t } = useTranslation("dashboard");
  const [displayedStats, setDisplayedStats] = useState<StatsType | null>(null);

  useEffect(() => {
    if (stats && !displayedStats) {
      setDisplayedStats(stats);
    }

    const interval = setInterval(() => {
      setDisplayedStats(stats);
    }, 60000);

    return () => clearInterval(interval);
  }, [stats, displayedStats]);

  if (isLoading || !displayedStats) {
    return (
      <div className={`overflow-hidden py-1 stats-strip-background ${className || ""}`}>
        <div className="flex w-max animate-roll">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center py-0.5 px-4 mr-4 bg-white rounded-md shadow-xs loading-pulse">
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
      recentChange: displayedStats.recentActivity.newReports,
      icon: MessageSquare,
      color: "text-sky-600",
      change: "+12%",
    },
    {
      title: t("verifiedReports"),
      value: displayedStats.verifiedReports,
      recentChange: displayedStats.recentActivity.newVerifications,
      icon: CheckCircle,
      color: "text-green-600",
      change: "+8%",
    },
    {
      title: t("activeHazards"),
      value: displayedStats.activeHazards,
      recentChange: displayedStats.recentActivity.newHazards,
      icon: AlertTriangle,
      color: "text-orange-600",
      change: "-5%",
    },
    {
      title: t("socialMentions"),
      value: displayedStats.socialMediaMentions,
      recentChange: displayedStats.recentActivity.newMentions,
      icon: TrendingUp,
      color: "text-purple-600",
      change: "+24%",
    },
  ];

  return (
            <div className={`overflow-hidden py-1 stats-strip-background border-b ${className || ""}`}>
              <div className="flex w-max animate-roll">        {statCards.map((stat, index) => (
          <div key={index} className="flex items-center py-0.5 px-4 mr-3 bg-white rounded-md shadow-xs whitespace-nowrap">
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <p className="text-xs font-normal text-neutral-500 ml-2">{stat.title}</p>
            <p className="text-sm font-semibold text-neutral-800 ml-2">{stat.value}</p>
            {stat.recentChange > 0 ? (
              <div className="flex items-center text-green-500 ml-2">
                <ArrowUp className="h-2.5 w-2.5" />
                <span className="text-xs font-normal">{stat.recentChange}</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500 ml-2">
                <ArrowDown className="h-2.5 w-2.5" />
                <span className="text-xs font-normal">{stat.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
