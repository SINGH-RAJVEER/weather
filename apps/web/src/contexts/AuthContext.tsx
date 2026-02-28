import type { AuthContextType, User } from "@weather/types";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("incois_token");
      if (token) {
        try {
          const response = await fetch("http://localhost:3000/api/user/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        if (token) {
          localStorage.setItem("incois_token", token);
          const userResponse = await fetch("http://localhost:3000/api/user/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
        } else {
          throw new Error("No token received");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: User["role"]) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        localStorage.setItem("incois_token", token);

        // Fetch user data to update context
        const userResponse = await fetch("http://localhost:3000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error; // Re-throw to let the UI handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("incois_token");
  };

  const updateUserProfile = async (updatedUser: {
    name?: string;
    email?: string;
    password?: string;
  }) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("incois_token");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await fetch("http://localhost:3000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user); // Update user in context with data from backend
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("incois_token");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("http://localhost:3000/api/user/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // The backend should return the updated user object or at least the new profile picture URL
        // For now, we'll assume it returns { profilePicture: "/path/to/new/pic.jpg" }
        // and update the user state accordingly.
        setUser((prevUser) => {
          if (prevUser) {
            return { ...prevUser, profilePicture: data.profilePicture };
          }
          return null;
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload profile picture error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserProfile,
        uploadProfilePicture,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
