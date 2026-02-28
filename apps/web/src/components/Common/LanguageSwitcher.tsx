import { Globe } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = "" }) => {
  const { i18n, t } = useTranslation("common");

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Globe className="h-4 w-4 text-black" />
        <span className="text-sm font-medium text-black">{t("language")}</span>
      </div>
      <select
        className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61bcc1] focus:border-transparent text-black bg-white"
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};
