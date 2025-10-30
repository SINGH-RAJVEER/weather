import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useData } from "../../contexts/DataContext";

export interface HazardReport {
  id: string;
  type:
    | "flood"
    | "swell serge"
    | "cyclone"
    | "tsunami"
    | "storm serge"
    | "costal current"
    | "costal flooding"
    | "costal damage";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  userName: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ center = [13, 85], zoom = 5 }) => {
  const mapRef = useRef<L.Map | null>(null);
  const heatRef = useRef<L.HeatLayer | null>(null);
  const { reports: hazardReports } = useData();

  const severityToIntensity: Record<string, number> = {
    critical: 1.0,
    high: 0.75,
    medium: 0.45,
    low: 0.2,
  };

  const heatmapPoints: [number, number, number][] = hazardReports.map((r) => [
    r.location.lat,
    r.location.lng,
    severityToIntensity[r.severity],
  ]);

  const getMarkerIcon = (severity: string) => {
    const colorMap: Record<string, string> = {
      critical: "red",
      high: "orange",
      medium: "yellow",
      low: "green",
    };
    const color = colorMap[severity] || "blue";

    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", { preferCanvas: true }).setView(
        center,
        zoom
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView(center, zoom);
    }

    const map = mapRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    hazardReports.forEach((report) => {
      const popupContent = `
        <b>Type:</b> ${report.type} <br/>
        <b>Severity:</b> ${report.severity} <br/>
        <b>Description:</b> ${report.description} <br/>
        <b>Reported by:</b> ${report.userName} <br/>
        <b>Location:</b> ${report.location.address}
      `;
      L.marker([report.location.lat, report.location.lng], {
        icon: getMarkerIcon(report.severity),
      })
        .addTo(map)
        .bindPopup(popupContent);
    });

    if (heatRef.current) {
      try {
        map.removeLayer(heatRef.current);
      } catch {
        // ignore error if layer is already removed
      }
      heatRef.current = null;
    }

    const heatOptions: L.HeatLayerOptions = {
      radius: 70,
      blur: 35,
      maxZoom: 10,
      max: 1,
      minOpacity: 0.35,

      gradient: {
        0.0: "#2222ff",
        0.3: "#66ccff",
        0.5: "#ffff00",
        0.7: "#ff9900",
        0.9: "#ff3300",
        1.0: "#990000",
      },
    };

    heatRef.current = L.heatLayer(heatmapPoints, heatOptions).addTo(map);

    map.on("zoomend", () => {
      const zoomLevel = map.getZoom();
      const newRadius = Math.max(25, 100 - zoomLevel * 5); // shrink as zoom increases
      if (heatRef.current) {
        heatRef.current.setOptions({ radius: newRadius });
      }
    });

    return () => {
      if (heatRef.current && map) {
        try {
          map.removeLayer(heatRef.current);
        } catch {
          /* ignore error if layer is already removed */
        }
        heatRef.current = null;
      }
    };
  }, [center, zoom, hazardReports, heatmapPoints]);

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
    />
  );
};

export default MapView;
