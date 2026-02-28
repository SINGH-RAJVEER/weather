import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enAnalyst from "./locales/en/analyst.json";
import enAnalytics from "./locales/en/analytics.json";
import enAuth from "./locales/en/auth.json";
// Import translation files
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enHeader from "./locales/en/header.json";
import enNews from "./locales/en/news.json";
import enOfficial from "./locales/en/official.json";
import enReports from "./locales/en/reports.json";
import hiAnalyst from "./locales/hi/analyst.json";
import hiAnalytics from "./locales/hi/analytics.json";
import hiAuth from "./locales/hi/auth.json";
import hiCommon from "./locales/hi/common.json";
import hiDashboard from "./locales/hi/dashboard.json";
import hiHeader from "./locales/hi/header.json";
import hiNews from "./locales/hi/news.json";
import hiOfficial from "./locales/hi/official.json";
import hiReports from "./locales/hi/reports.json";
import knAnalyst from "./locales/kn/analyst.json";
import knAnalytics from "./locales/kn/analytics.json";
import knAuth from "./locales/kn/auth.json";
import knCommon from "./locales/kn/common.json";
import knDashboard from "./locales/kn/dashboard.json";
import knHeader from "./locales/kn/header.json";
import knNews from "./locales/kn/news.json";
import knOfficial from "./locales/kn/official.json";
import knReports from "./locales/kn/reports.json";

const resources = {
  en: {
    common: enCommon,
    header: enHeader,
    dashboard: enDashboard,
    auth: enAuth,
    reports: enReports,
    analytics: enAnalytics,
    news: enNews,
    analyst: enAnalyst,
    official: enOfficial,
  },
  hi: {
    common: hiCommon,
    header: hiHeader,
    dashboard: hiDashboard,
    auth: hiAuth,
    reports: hiReports,
    analytics: hiAnalytics,
    news: hiNews,
    analyst: hiAnalyst,
    official: hiOfficial,
  },
  kn: {
    common: knCommon,
    header: knHeader,
    dashboard: knDashboard,
    auth: knAuth,
    reports: knReports,
    analytics: knAnalytics,
    news: knNews,
    analyst: knAnalyst,
    official: knOfficial,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,

    // Language detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace configuration
    defaultNS: "common",
    ns: [
      "common",
      "header",
      "dashboard",
      "auth",
      "reports",
      "analytics",
      "news",
      "analyst",
      "official",
    ],
  });

export default i18n;
