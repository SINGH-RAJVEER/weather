import { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = {
      id: "1",
      email,
      name: email.split("@")[0],
      role: email.includes("official")
        ? "official"
        : email.includes("analyst")
          ? "analyst"
          : "citizen",
      location: {
        lat: 13.0827,
        lng: 80.2707,
        address: "Chennai, Tamil Nadu, India",
      },
    };

    setUser(mockUser);

    try {
      await AsyncStorage.setItem("incois_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Error storing user:", error);
    }

    setIsLoading(false);
  };

  const register = async (email, password, name, role) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      location: {
        lat: 13.0827,
        lng: 80.2707,
        address: "Chennai, Tamil Nadu, India",
      },
    };

    setUser(newUser);

    try {
      await AsyncStorage.setItem("incois_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Error storing user:", error);
    }

    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem("incois_user");
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
