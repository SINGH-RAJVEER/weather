import type { Location } from "@weather/types";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";

type LocationContextValue = {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedCoordinates: Pick<Location, "lat" | "lng">;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

export default function LocationProvider({ children }: PropsWithChildren) {
  const [selectedLocation, setSelectedLocation] = useState("Chennai, Tamil Nadu, India");
  const [selectedCoordinates] = useState<Pick<Location, "lat" | "lng">>({
    lat: 13.0827,
    lng: 80.2707,
  });

  return (
    <LocationContext.Provider
      value={{ selectedLocation, setSelectedLocation, selectedCoordinates }}
    >
      {children}
    </LocationContext.Provider>
  );
}
