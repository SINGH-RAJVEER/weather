import React from "react";
import { View, Text } from "react-native";
import { useLocation } from "../../contexts/LocationContext";

const locationSummaries = {
  Chennai:
    "Chennai is currently experiencing moderate wave activity with occasional high tides. Coastal vigilance is advised, especially near popular beaches.",
  Cuddalore:
    "Cuddalore has reported a recent swell surge, leading to minor flooding in low-lying areas. Residents are advised to stay alert for official advisories.",
  Kasimedu:
    "The fishing harbor is seeing increased coastal erosion and some damage to boats. Fishermen are urged to avoid venturing out until conditions improve.",
  "Andhra Pradesh":
    "The Andhra Pradesh coastline is on high alert due to a cyclonic storm formation. Emergency teams are on standby and evacuation plans are in place.",
  National:
    "Coastal regions across India are being monitored for ocean hazards. The new early warning system is operational to provide timely alerts.",
};

function getLocationSummary(loc) {
  for (const key of Object.keys(locationSummaries)) {
    if (loc && loc.includes(key)) return locationSummaries[key];
  }
  return "No summary available for this location.";
}

const LocationSummary = () => {
  const { selectedLocation } = useLocation();

  return (
    <View className="bg-white rounded-xl p-6 shadow mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-neutral-900">
          {selectedLocation.split(",")[0]} Summary
        </Text>
      </View>
      <Text className="text-neutral-700 text-sm mt-2 leading-5">
        {getLocationSummary(selectedLocation)}
      </Text>
    </View>
  );
};

export default LocationSummary;
