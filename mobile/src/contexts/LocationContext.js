import React, { createContext, useContext, useState } from "react";

const LocationContext = createContext(undefined);

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

export default function LocationProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(
    "Chennai, Tamil Nadu, India"
  );

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
}
