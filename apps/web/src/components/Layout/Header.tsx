import { LogOut, MapPin, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useLocation } from "../../contexts/LocationContext";
import { LanguageSwitcher } from "../Common/LanguageSwitcher";
import { RollingStats } from "./RollingStats";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation(["common", "header"]);
  const { selectedLocation, setSelectedLocation, availableLocations } = useLocation();
  const [searchTerm, setSearchTerm] = useState(selectedLocation);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setSearchTerm(location);
    setDropdownOpen(false);
  };

  const getNavigationLabel = (id: string) => {
    if (user?.role === "citizen") {
      switch (id) {
        case "dashboard":
          return t("header:navigation.dashboard");
        case "report":
          return t("header:navigation.reportHazard");
        case "map":
          return t("header:navigation.liveMap");
        default:
          return id;
      }
    } else {
      switch (id) {
        case "map":
          return "Live Map";
        case "official-reports":
          return "Official Reports";
        case "analyst-report":
          return "Analyst Report";
        case "analytics":
          return "Analytics";
        case "social-monitor":
          return "Social Monitor";
        default:
          return id;
      }
    }
  };

  const navigationItems = [
    {
      id: "dashboard",
      label: getNavigationLabel("dashboard"),
      roles: ["citizen"],
    },
    {
      id: "map",
      label: getNavigationLabel("map"),
      roles: ["citizen", "official"],
    },
    {
      id: "official-reports",
      label: getNavigationLabel("official-reports"),
      roles: ["official"],
    },
    {
      id: "analyst-report",
      label: getNavigationLabel("analyst-report"),
      roles: ["analyst"],
    },
    {
      id: "analytics",
      label: getNavigationLabel("analytics"),
      roles: ["analyst"],
    },
    {
      id: "social-monitor",
      label: getNavigationLabel("social-monitor"),
      roles: ["analyst", "official"],
    },
  ];

  const { stats, isLoading: isStatsLoading } = useData();
  const filteredNavItems = navigationItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <>
      <header className="bg-[#012340] border-b border-[#03588c] sticky top-0 z-[3000] shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/icon.svg" alt="SHORE Logo" className="h-10 w-10 drop-shadow-md" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  {user?.role === "citizen" ? t("common:appName") : "SHORE"}
                </h1>
                <p className="text-xs text-[#61bcc1]">
                  {user?.role === "citizen"
                    ? t("common:appFullName")
                    : "Smart Hazard Operations & Response Engine"}
                </p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-[#03588c] text-white shadow-xs" // gap-blue
                      : "text-[#61bcc1] hover:text-white hover:bg-[#03588c]"
                  }`}
                >
                  {item.id === "map" && user?.role === "official" ? "Live Risk " : item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Location dropdown */}
              {user?.role === "citizen" && (
                <div className="relative flex items-center" style={{ zIndex: 40 }}>
                  <span className="absolute left-2 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-[#61bcc1]" />
                  </span>
                  <input
                    type="text"
                    className="bg-[#03588c] text-white pl-8 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#61bcc1] appearance-none w-64"
                    value={dropdownOpen ? searchTerm : selectedLocation}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setSearchTerm("");
                      setDropdownOpen(true);
                    }}
                    onBlur={() => setDropdownOpen(false)}
                    placeholder="Search location..."
                  />
                  {dropdownOpen && filteredLocations.length > 0 && (
                    <div className="absolute top-full left-0 w-full min-w-max bg-[#03588c] border border-[#03588c] rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto hide-scrollbar">
                      {filteredLocations.map((location) => (
                        <div
                          key={location}
                          className="px-3 py-2 text-white hover:bg-[#056b9f] cursor-pointer"
                          onMouseDown={() => handleSelectLocation(location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-[#61bcc1] capitalize">
                    {user?.role === "citizen" ? t(`common:roles.${user?.role}`) : user?.role}
                  </p>
                </div>

                <div className="relative group">
                  <button className="flex items-center space-x-1 p-2 rounded-lg hover:bg-[#03588c]">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden bg-[#03588c]">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 card-bg rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-60">
                    <div className="py-2">
                      {/* Show language switcher only for citizens */}
                      {user?.role === "citizen" && (
                        <div className="px-4 py-2 border-b border-neutral-200">
                          <LanguageSwitcher />
                        </div>
                      )}

                      <button
                        onClick={() => onNavigate("edit-profile")}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>{user?.role === "citizen" ? t("common:profile") : "Profile"}</span>
                      </button>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{user?.role === "citizen" ? t("common:signOut") : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {user?.role === "citizen" && currentPage === "dashboard" && (
        <RollingStats stats={stats} isLoading={isStatsLoading} />
      )}
    </>
  );
};
