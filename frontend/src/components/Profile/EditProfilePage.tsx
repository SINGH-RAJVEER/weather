import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface EditProfilePageProps {
  onBack: () => void;
}

export const EditProfilePage: React.FC<EditProfilePageProps> = ({ onBack }) => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useTranslation(["common", "editProfile"]);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(user?.profilePicture || null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfilePicturePreview(user.profilePicture || null);
    }
  }, [user]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    } else {
      setProfilePictureFile(null);
      setProfilePicturePreview(user?.profilePicture || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError(t("editProfile:passwordMismatch"));
      return;
    }

    try {
      const updatedFields: { name?: string; email?: string; password?: string } = {};
      if (name !== user?.name) updatedFields.name = name;
      if (email !== user?.email) updatedFields.email = email;
      if (password) updatedFields.password = password;

      await updateUserProfile(updatedFields);

      if (profilePictureFile) {
        await uploadProfilePicture(profilePictureFile);
      }

      setMessage(t("editProfile:profileUpdatedSuccessfully"));
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(t("editProfile:failedToUpdateProfile"));
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md bg-white rounded-lg shadow-lg p-6 border border-neutral-200 text-neutral-900 relative">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("editProfile:editProfile")}
      </h2>

      {/* Profile Picture Upload Section */}
      <div className="mb-6">
        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2 text-center">
          {t("editProfile:profilePicture")}
        </label>
        <div className="flex flex-col items-center space-y-4">
          {profilePicturePreview ? (
            <img src={profilePicturePreview} alt="Profile Preview" className="h-28 w-28 rounded-full object-cover border-2 border-sky-500" />
          ) : (
            <div className="h-28 w-28 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-4xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <Input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="block w-full text-sm text-neutral-900
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-sky-50 file:text-sky-700
            hover:file:bg-sky-100"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t("common:name")}
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t("common:email")}
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t("common:password")} ({t("editProfile:leaveBlankToKeepCurrent")})
          </label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t("editProfile:confirmPassword")}
          </label>
          <Input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <div className="flex justify-between space-x-2">
          <Button type="button" className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700" onClick={onBack}>
            {t("common:cancel")}
          </Button>
          <Button type="submit">
            {t("common:saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
};
