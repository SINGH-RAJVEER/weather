import type React from "react";
import { createContext, useContext, useState } from "react";

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  availableLocations: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Chennai, Tamil Nadu, India");

  const availableLocations = [
    "Chennai, Tamil Nadu, India",
    "Cuddalore, Tamil Nadu, India",
    "Kasimedu, Tamil Nadu, India",
    "Mumbai, Maharashtra, India",
    "Kochi, Kerala, India",
    "Visakhapatnam, Andhra Pradesh, India",
    "Kolkata, West Bengal, India",
  ];

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation, availableLocations }}>
      {children}
    </LocationContext.Provider>
  );
};
