import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const LiveRiskScore = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // Fake a loading state (Google Maps JS loader equivalent)
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <View className="h-96 items-center justify-center bg-white rounded-xl shadow">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-neutral-600 mt-4">Loading map data...</Text>
      </View>
    );
  }

  return (
    <View className="w-full h-96 rounded-xl overflow-hidden">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 12.9716,
          longitude: 77.5946,
          latitudeDelta: 2, // zoom level approximation
          longitudeDelta: 2,
        }}
      >
        <Marker
          coordinate={{ latitude: 12.9716, longitude: 77.5946 }}
          title="Bangalore"
          description="Sample marker for risk score"
        />
      </MapView>
    </View>
  );
};

export default LiveRiskScore;
