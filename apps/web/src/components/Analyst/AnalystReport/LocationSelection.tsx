import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  FileText,
  Loader,
  Map,
  MapPin,
  Target,
  Waves,
} from "lucide-react";
import type React from "react";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationMetrics {
  totalReports: number;
  verifiedReports: number;
  activeHazards: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  dominantHazard: string;
  lastUpdate: string;
}

export interface LocationData {
  city: string;
  state: string;
  coordinates: Coordinates;
  metrics: LocationMetrics;
}

interface LocationSelectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLocation: LocationData | null;
  setSelectedLocation: (value: LocationData | null) => void;
  filteredCities: string[];
  mockLocationData: Record<string, LocationData>;
  isGenerating: boolean;
  onGenerate: () => void;
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-green-100 text-green-700 border-green-200";
  }
};

export const LocationSelection: React.FC<LocationSelectionProps> = ({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  setSelectedLocation,
  filteredCities,
  mockLocationData,
  isGenerating,
  onGenerate,
}) => {
  return (
    <div className="space-y-6">
      <div className="hazard-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Generate Report</h2>
            <p className="text-sm text-neutral-600">
              Select location to generate AI-powered analysis report
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Search Location</label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by city or state name..."
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredCities.map((city) => {
            const location = mockLocationData[city];
            const isSelected = selectedLocation?.city === city;

            return (
              <div
                key={city}
                onClick={() =>
                  isSelected ? setSelectedLocation(null) : setSelectedLocation(location)
                }
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-neutral-200 hover:border-blue-300 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{location.city}</h3>
                    <p className="text-sm text-neutral-600">{location.state}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(
                      location.metrics.riskLevel
                    )}`}
                  >
                    {location.metrics.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Reports:</span>
                    <span className="font-medium">{location.metrics.totalReports}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Primary Hazard:</span>
                    <span className="font-medium text-orange-600">
                      {location.metrics.dominantHazard}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <div className="flex items-center space-x-1 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" />
                    <span>Updated {location.metrics.lastUpdate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedLocation && (
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {selectedLocation.city}, {selectedLocation.state}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {selectedLocation.coordinates.lat.toFixed(4)},{" "}
                    {selectedLocation.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskLevelColor(
                  selectedLocation.metrics.riskLevel
                )}`}
              >
                {selectedLocation.metrics.riskLevel.toUpperCase()} RISK
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center space-x-2">
                <Map className="h-4 w-4" />
                <span>Location Preview</span>
              </h4>
              <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-48 overflow-hidden border border-blue-200">
                <div className="absolute inset-0 opacity-30">
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 via-blue-100 to-green-100"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                        selectedLocation.metrics.riskLevel === "critical"
                          ? "bg-red-500"
                          : selectedLocation.metrics.riskLevel === "high"
                            ? "bg-orange-500"
                            : selectedLocation.metrics.riskLevel === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                    ></div>
                    <div
                      className={`absolute inset-0 rounded-full ${
                        selectedLocation.metrics.riskLevel === "critical"
                          ? "bg-red-500"
                          : selectedLocation.metrics.riskLevel === "high"
                            ? "bg-orange-500"
                            : selectedLocation.metrics.riskLevel === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      } opacity-30 animate-ping`}
                    ></div>
                  </div>
                </div>

                {[...Array(selectedLocation.metrics.activeHazards)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${40 + i * 15}%`,
                      top: `${35 + i * 10}%`,
                    }}
                  >
                    <div className="w-3 h-3 bg-orange-400 rounded-full border border-white shadow-sm"></div>
                  </div>
                ))}

                <div className="absolute bottom-3 left-3 bg-white p-2 rounded-lg shadow-lg border border-neutral-200">
                  <div className="flex items-center space-x-2 text-xs font-medium text-neutral-700">
                    <Activity className="h-3 w-3" />
                    <span>{selectedLocation.city} Coast</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-neutral-600">Total Reports</span>
                </div>
                <p className="text-lg font-bold text-neutral-900">
                  {selectedLocation.metrics.totalReports}
                </p>
              </div>

              <div className="flex-1 card-bg p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-neutral-600">Active Hazards</span>
                </div>
                <p className="text-lg font-bold text-neutral-900">
                  {selectedLocation.metrics.activeHazards}
                </p>
              </div>

              <div className="flex-1 card-bg p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Waves className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-neutral-600">Primary Risk</span>
                </div>
                <p className="text-sm font-bold text-neutral-900">
                  {selectedLocation.metrics.dominantHazard}
                </p>
              </div>
            </div>

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelection;
