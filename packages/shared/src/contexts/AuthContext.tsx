import type { AuthContextType, User } from "@weather/types";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { STORAGE_KEYS } from "../constants";
import type { StorageAdapter } from "../utils/storage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  storage: StorageAdapter;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, storage }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          const userData = await api.auth.getCurrentUser(token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        // Clear invalid token
        await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [storage]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { token, user: userData } = await api.auth.login(email, password);
        await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        setUser(userData);
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storage]
  );

  const register = useCallback(
    async (email: string, password: string, name: string, role: User["role"]) => {
      setIsLoading(true);
      try {
        const { token, user: userData } = await api.auth.register({
          email,
          password,
          name,
          role,
        });
        await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        setUser(userData);
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [storage]
  );

  const logout = useCallback(async () => {
    setUser(null);
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }, [storage]);

  const updateUserProfile = useCallback(
    async (updates: Partial<Pick<User, "name" | "role" | "location">>) => {
      if (!user) {
        throw new Error("No user logged in");
      }

      try {
        const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const updatedUser = await api.auth.updateProfile(user.id, updates, token);
        setUser(updatedUser);
      } catch (error) {
        console.error("Failed to update profile:", error);
        throw error;
      }
    },
    [user, storage]
  );

  const uploadProfilePicture = useCallback(async (file: File | any): Promise<void> => {
    // This would need a proper implementation with file upload
    console.log("Profile picture upload not yet implemented", file);
    throw new Error("Profile picture upload not yet implemented");
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      login,
      register,
      logout,
      updateUserProfile,
      uploadProfilePicture,
      isLoading,
    }),
    [user, isLoading, login, register, logout, updateUserProfile, uploadProfilePicture]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
