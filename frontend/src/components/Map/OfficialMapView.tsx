import React, { useEffect, useRef, useState, useMemo } from "react";
import * as L from "leaflet";
import type { Map, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Button } from "@/components/ui/button";
import { HWAReport } from "@/types/types";
import type { LayerToggle } from "@/types/types";

// helper to get numeric intensity from color or severity
const intensityFromReport = (r: HWAReport) => {
  if (typeof r.severityScore === "number") {
    if (r.severityScore >= 3) return 1.0;
    if (r.severityScore === 2) return 0.6;
    return 0.3;
  }
  const c = (r.Color || r.color || "green").toString().toLowerCase();
  if (c === "red") return 1.0;
  if (c === "orange") return 0.78;
  if (c === "yellow") return 0.55;
  if (c === "green") return 0.18;
  return 0.3;
};

const coastalBoxes = [
  // West coast
  { latMin: 20, latMax: 24.5, lonMin: 68, lonMax: 73 },   // Gujarat
  { latMin: 15.5, latMax: 20, lonMin: 72, lonMax: 74.5 }, // Maharashtra-Goa
  { latMin: 8, latMax: 15.5, lonMin: 74, lonMax: 77 },    // Karnataka-Kerala

  // East coast
  { latMin: 19, latMax: 22.5, lonMin: 85, lonMax: 87 },   // Odisha
  { latMin: 13, latMax: 19, lonMin: 80, lonMax: 85 },     // Andhra
  { latMin: 8, latMax: 13, lonMin: 79, lonMax: 81.5 },    // Tamil Nadu
  { latMin: 21, latMax: 23.5, lonMin: 87.5, lonMax: 89.5 } // West Bengal
];

const LiveRiskScore: React.FC = () => {
  const mapRef = useRef<Map | null>(null);
  const riskRef = useRef<Layer | null>(null);
  const swellHeatRef = useRef<Layer | null>(null);
  const swellDotsRef = useRef<Layer | null>(null);
  const densityRef = useRef<Layer | null>(null);

  const [hazard, setHazard] = useState<HWAReport[]>([]);
  const [toggles, setToggles] = useState<LayerToggle>({
    heatmap: true,
    swellHeat: false,
    swellDots: false,
    density: false,
  });

  var isMenuOpen = false;

    const fetchHazardData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/mapReports");
        const data = await res.json();
        setHazard(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("fetch error", e);
      }
    };
    fetchHazardData();

  // density points for that layer random 
const densityPoints = () => {
  const pts: [number, number, number][] = [];
  const total = 200;
  for (let i = 0; i < total; i++) {
    const box = coastalBoxes[Math.floor(Math.random() * coastalBoxes.length)];
    const lat = box.latMin + Math.random() * (box.latMax - box.latMin);
    const lon = box.lonMin + Math.random() * (box.lonMax - box.lonMin);
    const intensity = 0.3 + Math.random() * 0.7;
    pts.push([lat, lon, intensity]);
  }
  return pts;
};


  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", { preferCanvas: true }).setView([13, 80], 5);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
      setTimeout(() => mapRef.current?.invalidateSize(), 200);
    }
    const map = mapRef.current!;

    if (riskRef.current) {
      map.removeLayer(riskRef.current);
      riskRef.current = null;
    }
    if (swellHeatRef.current) {
      map.removeLayer(swellHeatRef.current);
      swellHeatRef.current = null;
    }
    if (swellDotsRef.current) {
      map.removeLayer(swellDotsRef.current);
      swellDotsRef.current = null;
    }
    if (densityRef.current) {
      map.removeLayer(densityRef.current);
      densityRef.current = null;
    }

    if (toggles.heatmap) {
      const grp = L.layerGroup();
      hazard.forEach((r) => {
        if (!r.coordinates || typeof r.coordinates.lat !== "number" || typeof r.coordinates.lon !== "number") return;
        const colorKey = (r.Color || r.color || "green").toString().toLowerCase();
        const fill =
          colorKey === "red" ? "#ff0000" :
          colorKey === "orange" ? "#ff9900" :
          colorKey === "yellow" ? "#ffff00" :
          "#00ff00";

        L.circleMarker([r.coordinates.lat, r.coordinates.lon], {
          radius: 7,
          color: "#222",
          weight: 1,
          fillColor: fill,
          fillOpacity: 0.9,
        })
          .bindPopup(
            `<strong>${(r.District || r.city) ?? "Unknown"}</strong><br/>${r.hazardType || "-"} / ${r.Color || r.color || "-"}`
          )
          .addTo(grp);
      });
      riskRef.current = grp.addTo(map);
    }

    // SWELL DOTS
    if (toggles.swellDots) {
      const grp = L.layerGroup();
      hazard.filter(h => typeof h.hazardType === "string" && /swell/i.test(h.hazardType)).forEach((r) => {
        if (!r.coordinates || typeof r.coordinates.lat !== "number" || typeof r.coordinates.lon !== "number") return;
        const colorKey = (r.Color || r.color || "green").toString().toLowerCase();
        const fill =
          colorKey === "red" ? "#ff0000" :
          colorKey === "orange" ? "#ff9900" :
          colorKey === "yellow" ? "#ffff00" :
          "#00aaff";

        L.circleMarker([r.coordinates.lat, r.coordinates.lon], {
          radius: 6,
          color: "#000",
          weight: 1,
          fillColor: fill,
          fillOpacity: 0.95,
        })
          .bindPopup(
            `<strong>Swell @ ${(r.District || r.city) ?? "Unknown"}</strong><br/>Severity: ${r.severityScore ?? "-"} / ${r.Color || r.color || "-"}`
          )
          .addTo(grp);
      });
      swellDotsRef.current = grp.addTo(map);
    }

    if (toggles.swellHeat) {
  const swellReports = hazard.filter(h => typeof h.hazardType === "string" && /swell/i.test(h.hazardType));
  const swellPoints: [number, number, number][] = [];

  swellReports.forEach((r) => {
    if (!r.coordinates) return;
    const baseIntensity = intensityFromReport(r); // 0.18..1.0
    const num = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i < num; i++) {
      const latOffset = (Math.random() - 0.5) * 0.5;
      const lonOffset = (Math.random() - 0.5) * 0.5;

      // keep reds strong
      const intensity = Math.max(0.3, baseIntensity * (0.8 + Math.random() * 0.4));
      swellPoints.push([r.coordinates.lat + latOffset, r.coordinates.lon + lonOffset, intensity]);
    }
  });

  if (swellPoints.length) {
    swellHeatRef.current = L.heatLayer(swellPoints, {
      radius: 40,
      blur: 50,
      maxZoom: 10,
      max: 1,
      minOpacity: 0.3,
      gradient: {
        0.0: "#00ff00",
        0.4: "#ffff00",
        0.65: "#ff9900",
        0.85: "#ff0000",
      },
    });
    map.addLayer(swellHeatRef.current);
 
      } else {
        // if no swell points, helpful debug console (you can remove)
        console.debug("No swell points to create heatmap (check hazard.hazardType / coordinates).");
      }
    }

    // DENSITY layer
    if (toggles.density) {
      densityRef.current = L.heatLayer(densityPoints, {
        radius: 30,
        blur: 40,
        max: 1,
        minOpacity: 0.4,
      });
      map.addLayer(densityRef.current);
    }

    // Zoom handler to rebuild heat layers with scaled radius/blur
    const onZoom = () => {
      const z = map.getZoom();
      const scale = Math.max(10, 60 - z * 3);
      const blur = Math.max(8, 40 - z * 2);

      // rebuild swell heat if present
      if (swellHeatRef.current) {
        const swellReports = hazard.filter(h => typeof h.hazardType === "string" && /swell/i.test(h.hazardType));
        const swellPoints: [number, number, number][] = [];
        swellReports.forEach((r) => {
          if (!r.coordinates) return;
          const baseIntensity = intensityFromReport(r);
          const num = 8 + Math.floor(Math.random() * 6);
          for (let i = 0; i < num; i++) {
            const latOffset = (Math.random() - 0.5) * 0.5;
            const lonOffset = (Math.random() - 0.5) * 0.5;
            const intensity = Math.max(0.3, baseIntensity * (0.8 + Math.random() * 0.4));
            swellPoints.push([r.coordinates.lat + latOffset, r.coordinates.lon + lonOffset, intensity]);
          }
        });

        map.removeLayer(swellHeatRef.current);
        if (swellPoints.length) {
          swellHeatRef.current = L.heatLayer(swellPoints, {
            radius: scale,
            blur,
            max: 1,
            minOpacity: 0.2,
            gradient: {
              0.0: "#00ff00",
              0.55: "#ffff00",
              0.78: "#ff9900",
              1.0: "#ff0000",
            },
          });
          map.addLayer(swellHeatRef.current);
        } else {
          swellHeatRef.current = null;
        }
      }

      // rebuild density
      if (densityRef.current) {
        map.removeLayer(densityRef.current);
        densityRef.current = L.heatLayer(densityPoints, {
          radius: scale * 0.6,
          blur,
          max: 1,
          minOpacity: 0.35,
        });
        map.addLayer(densityRef.current);
      }
    };

    map.off("zoomend", onZoom);
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [hazard, toggles, densityPoints]);

  const toggleLayer = (k: keyof LayerToggle) => setToggles(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div
      id="map"
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        width: "100vw",
        height: "calc(100vh - 64px)",
        zIndex: 0,
      }}
    >
      <Button
        variant="outline"
        className="absolute top-4 right-4 z-[2200] p-3 bg-blue-600/90 text-white backdrop-blur-sm rounded-md shadow-lg hover:bg-blue-700/90 transition-colors duration-200"
        onClick={() => isMenuOpen = !isMenuOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>

      {isMenuOpen && (
        <div
          className="fixed right-0 top-16 h-[calc(100vh-4rem)] z-[2200] w-64 bg-white/70 dark:bg-gray-900/70 border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col backdrop-blur-md transition-all duration-300"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="text-lg font-semibold">Map Layers</div>
            <Button
              variant="ghost"
              className="p-2 text-gray-600 dark:text-white hover:bg-gray-200/70 dark:hover:bg-gray-700/70"
              onClick={() => isMenuOpen = false}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
          <div className="p-4 space-y-2 flex-1 overflow-auto">
            <Button
              className={`w-full ${toggles.heatmap ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}
              onClick={() => toggleLayer("heatmap")}
            >
              Risk Assessment
            </Button>

            <Button
              className={`w-full ${toggles.density ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}
              onClick={() => toggleLayer("density")}
            >
              Swell Surge
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};

export default LiveRiskScore;
