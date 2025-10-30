import { User } from "../types/types";

const API_BASE_URL = "http://localhost:3000/api";

export const updateUserProfile = async (
  userId: string,
  name: string,
  role: User["role"],
  token: string
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user profile");
  }

  return response.json();
};
