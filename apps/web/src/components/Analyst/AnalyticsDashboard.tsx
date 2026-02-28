import { AlertTriangle, BarChart3, Calendar, MapPin, TrendingUp } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

// Static chart data
const getSeverityData = () => [
  { name: "Low", value: 35, color: "#22c55e" },
  { name: "Medium", value: 40, color: "#eab308" },
  { name: "High", value: 20, color: "#f97316" },
  { name: "Critical", value: 5, color: "#ef4444" },
];

const getRegionData = () => [
  { name: "Tamil Nadu", reports: 45, verified: 32 },
  { name: "Andhra Pradesh", reports: 38, verified: 28 },
  { name: "Odisha", reports: 29, verified: 22 },
  { name: "West Bengal", reports: 22, verified: 18 },
  { name: "Karnataka", reports: 18, verified: 14 },
];

const getMonthlyData = () => [
  {
    name: "Jan",
    tsunami: 2,
    storm_surge: 5,
    high_waves: 12,
    flooding: 8,
  },
  {
    name: "Feb",
    tsunami: 1,
    storm_surge: 8,
    high_waves: 15,
    flooding: 10,
  },
  {
    name: "Mar",
    tsunami: 0,
    storm_surge: 12,
    high_waves: 20,
    flooding: 15,
  },
  {
    name: "Apr",
    tsunami: 3,
    storm_surge: 6,
    high_waves: 18,
    flooding: 12,
  },
  {
    name: "May",
    tsunami: 1,
    storm_surge: 9,
    high_waves: 25,
    flooding: 18,
  },
  {
    name: "Jun",
    tsunami: 0,
    storm_surge: 15,
    high_waves: 30,
    flooding: 22,
  },
];

export const AnalyticsDashboard: React.FC = () => {
  const [_relevantTweets, setRelevantTweets] = React.useState<
    Array<{
      keyword: string;
      text: string;
      inserted_at?: string;
      relevant?: boolean;
    }>
  >([]);
  const [appliedKeywords, _setAppliedKeywords] = React.useState<string[]>([]);

  const fetchRelevantTweets = React.useCallback(async (keywords: string[]) => {
    const base = `http://localhost:5001/tweets/relevant`;
    const params = new URLSearchParams();
    if (keywords.length) {
      params.set("keywords", keywords.join(","));
    }
    params.set("limit", "50");
    const url = `${base}?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as Array<{
        keyword: string;
        text: string;
        inserted_at?: string;
        relevant?: boolean;
      }>;
      if (!Array.isArray(data)) return;

      // If nothing came back, try one-time recompute to backfill relevance
      let list = data;
      if (list.length === 0) {
        const params2 = new URLSearchParams(params);
        params2.set("recompute", "1");
        try {
          const res2 = await fetch(`${base}?${params2.toString()}`);
          if (res2.ok) {
            const data2 = (await res2.json()) as typeof data;
            if (Array.isArray(data2)) list = data2;
          }
        } catch {}
      }

      const sorted = [...list].sort((a, b) => {
        const ta = a.inserted_at ? Date.parse(a.inserted_at) : 0;
        const tb = b.inserted_at ? Date.parse(b.inserted_at) : 0;
        return tb - ta;
      });
      setRelevantTweets(sorted.slice(0, 20));
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchRelevantTweets(appliedKeywords);
  }, [appliedKeywords, fetchRelevantTweets]);

  const _formatTimeAgo = (iso?: string) => {
    if (!iso) return "";
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return "";
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="hazard-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Reports</p>
              <p className="text-2xl font-bold text-neutral-900">1,247</p>
              <p className="text-xs text-green-600 font-medium">+15% from last month</p>
            </div>
          </div>
        </div>

        <div className="hazard-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Verification Rate</p>
              <p className="text-2xl font-bold text-neutral-900">73%</p>
              <p className="text-xs text-green-600 font-medium">+5% improvement</p>
            </div>
          </div>
        </div>

        <div className="hazard-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Areas Monitored</p>
              <p className="text-2xl font-bold text-neutral-900">15</p>
              <p className="text-xs text-green-600 font-medium">+2 new regions this month</p>
            </div>
          </div>
        </div>

        <div className="hazard-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Hazards</p>
              <p className="text-2xl font-bold text-neutral-900">12</p>
              <p className="text-xs text-red-600 font-medium">+3 since yesterday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hazard-card">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Hazard Trends by Month</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="high_waves" stackId="a" fill="#3b82f6" />
              <Bar dataKey="storm_surge" stackId="a" fill="#14b8a6" />
              <Bar dataKey="flooding" stackId="a" fill="#f59e0b" />
              <Bar dataKey="tsunami" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="hazard-card">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Severity Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getSeverityData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (Number(percent) * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getSeverityData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hazard-card">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="h-5 w-5 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Reports by Region</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="reports"
                name="Reports"
                tick={{ fontSize: 12 }}
                label={{
                  value: "Reports",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                type="number"
                dataKey="verified"
                name="Verified"
                tick={{ fontSize: 12 }}
                label={{
                  value: "Verified",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
              />
              <ZAxis range={[100, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => {
                  const label =
                    typeof name === "string"
                      ? name.charAt(0).toUpperCase() + name.slice(1)
                      : String(name);
                  return [value, label];
                }}
              />
              <Scatter name="Regions" data={getRegionData()} fill="#3b82f6">
                <LabelList dataKey="name" position="top" fontSize={12} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="hazard-card">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-5 w-5 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Daily Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="high_waves"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="storm_surge"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ fill: "#14b8a6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="hazard-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recent Activity Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Region</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Hazard Type</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Reports</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  date: "2024-01-15",
                  region: "Chennai",
                  type: "High Waves",
                  severity: "High",
                  reports: 15,
                  status: "Active",
                },
                {
                  date: "2024-01-14",
                  region: "Cuddalore",
                  type: "Storm Surge",
                  severity: "Medium",
                  reports: 8,
                  status: "Resolved",
                },
                {
                  date: "2024-01-13",
                  region: "Visakhapatnam",
                  type: "Coastal Flooding",
                  severity: "Low",
                  reports: 12,
                  status: "Monitoring",
                },
                {
                  date: "2024-01-12",
                  region: "Paradip",
                  type: "High Waves",
                  severity: "Medium",
                  reports: 6,
                  status: "Resolved",
                },
              ].map((item, index) => (
                <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm text-neutral-700">{item.date}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{item.region}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{item.type}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.severity === "High"
                          ? "bg-red-100 text-red-700"
                          : item.severity === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{item.reports}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === "Active"
                          ? "bg-orange-100 text-orange-700"
                          : item.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Monitor moved to its own page */}
    </div>
  );
};
