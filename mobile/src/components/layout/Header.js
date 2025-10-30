import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { User, Settings, LogOut, MapPin } from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";

const Header = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { selectedLocation, setSelectedLocation } = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", roles: ["citizen"] },
    { id: "report", label: "Report Hazard", roles: ["citizen"] },
    { id: "map", label: "Live Map", roles: ["citizen", "official"] },
    { id: "official-reports", label: "Official Reports", roles: ["official"] },
    { id: "analyst-report", label: "Analyst Report", roles: ["analyst"] },
    { id: "analytics", label: "Analytics", roles: ["analyst"] },
  ];

  const filteredNavItems = navigationItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  const locationOptions = [
    "Chennai, Tamil Nadu, India",
    "Mumbai, Maharashtra, India",
    "Kochi, Kerala, India",
    "Visakhapatnam, Andhra Pradesh, India",
    "Kolkata, West Bengal, India",
  ];

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: logout, style: "destructive" },
    ]);
    setShowUserMenu(false);
  };

  return (
    <View className="bg-blue-900 border-b border-blue-700 px-4 py-3">
      <View className="flex-row justify-between items-center mb-4">
        {/* Logo and Title */}
        <View className="flex-row items-center flex-1 mr-4">
          <Image
            source={require("../../../assets/icon.png")}
            className="h-9 w-9"
            resizeMode="contain"
          />
          <View className="ml-3">
            <Text className="text-lg font-bold text-white">SHORE</Text>
            <Text className="text-xs text-cyan-300" numberOfLines={1}>
              Ocean Reporting Engine
            </Text>
          </View>
        </View>

        {/* User Info and Actions */}
        <View className="flex-row items-center">
          {/* Location Picker for Citizens */}
          {user?.role === "citizen" && (
            <Pressable
              onPress={() => setShowLocationPicker(true)}
              className="flex-row items-center bg-blue-700 px-3 py-2 rounded-lg mr-3"
              android_ripple={{ color: "#1e40af" }}
            >
              <MapPin size={14} color="#67e8f9" />
              <Text className="text-white text-xs ml-2" numberOfLines={1}>
                {selectedLocation?.split(",")[0] || "Location"}
              </Text>
            </Pressable>
          )}

          {/* User Menu */}
          <View className="flex-row items-center">
            <View className="items-end mr-3">
              <Text
                className="text-sm font-medium text-white"
                numberOfLines={1}
              >
                {user?.name}
              </Text>
              <Text className="text-xs text-cyan-300 capitalize">
                {user?.role}
              </Text>
            </View>

            <Pressable
              onPress={() => setShowUserMenu(true)}
              className="h-9 w-9 bg-blue-700 rounded-full items-center justify-center"
              android_ripple={{ color: "#1e40af" }}
            >
              <User size={16} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4"
        contentContainerStyle={{
          paddingHorizontal: 16,
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          {filteredNavItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onNavigate(item.id)}
              className={`px-4 py-2.5 rounded-lg ${
                currentPage === item.id ? "bg-blue-700" : "bg-transparent"
              }`}
              android_ripple={{ color: "#1e40af" }}
            >
              <Text
                className={`text-sm font-medium ${
                  currentPage === item.id ? "text-white" : "text-cyan-300"
                }`}
                numberOfLines={1}
              >
                {item.id === "map" && user?.role === "official"
                  ? "Live Risk Score"
                  : item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
        statusBarTranslucent
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Select Location
            </Text>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(value) => {
                setSelectedLocation(value);
                setShowLocationPicker(false);
              }}
              mode="dropdown"
            >
              {locationOptions.map((location) => (
                <Picker.Item key={location} label={location} value={location} />
              ))}
            </Picker>
            <Pressable
              onPress={() => setShowLocationPicker(false)}
              className="bg-gray-200 rounded-lg py-3 mt-4"
              android_ripple={{ color: "#d1d5db" }}
            >
              <Text className="text-center text-gray-700 font-medium">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
        statusBarTranslucent
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowUserMenu(false)}
        >
          <View className="bg-white rounded-xl w-48 shadow-lg">
            <Pressable
              className="flex-row items-center space-x-2 px-4 py-3 border-b border-gray-200"
              onPress={() => {
                setShowUserMenu(false);
                // Handle settings navigation
              }}
              android_ripple={{ color: "#f3f4f6" }}
            >
              <Settings size={16} color="#374151" />
              <Text className="text-sm text-gray-700">Settings</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center space-x-2 px-4 py-3"
              onPress={handleLogout}
              android_ripple={{ color: "#fef2f2" }}
            >
              <LogOut size={16} color="#dc2626" />
              <Text className="text-sm text-red-600">Sign Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Header;
