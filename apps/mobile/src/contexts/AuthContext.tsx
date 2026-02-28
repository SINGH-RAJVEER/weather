import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthContextType, User } from "@weather/types";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { normalizeDbUser } from "../api/dbAdapters";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = normalizeDbUser({
      id: "1",
      email,
      name: email.split("@")[0],
      role: email.includes("official")
        ? "official"
        : email.includes("analyst")
          ? "analyst"
          : "citizen",
    });

    setUser(mockUser);

    try {
      await AsyncStorage.setItem("incois_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Error storing user:", error);
    }

    setIsLoading(false);
  };

  const register = async (email: string, _password: string, name: string, role: User["role"]) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser = normalizeDbUser({
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
    });

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

  const updateUserProfile: AuthContextType["updateUserProfile"] = async (updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
  };

  const uploadProfilePicture: AuthContextType["uploadProfilePicture"] = async () => {
    return;
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      login: async (email: string, password: string) => {
        await login(email);
        void password;
      },
      register,
      logout,
      updateUserProfile,
      uploadProfilePicture,
      isLoading,
    }),
    [user, isLoading, login, logout, register, updateUserProfile, uploadProfilePicture]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
