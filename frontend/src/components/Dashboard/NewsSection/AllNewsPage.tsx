import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NewsArticle } from "../../../types/types";
import { formatDate } from "../../../utils";
import {
  Newspaper,
  ExternalLink,
  Clock,
  MapPin,
  AlertCircle,
  Leaf,
  AlertTriangle,
  CloudRain,
} from "lucide-react";

interface AllNewsPageProps {
  articles: NewsArticle[];
  isLoading: boolean;
  onBack: () => void;
}

const AllNewsPage: React.FC<AllNewsPageProps> = ({
  articles,
  isLoading,
  onBack,
}) => {
  const { t } = useTranslation(["news", "common"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: "all", label: t("news:categories.all"), icon: Newspaper },
    { id: "breaking", label: t("news:categories.breaking"), icon: AlertCircle },
    { id: "environment", label: t("news:categories.environment"), icon: Leaf },
    {
      id: "disaster",
      label: t("news:categories.disaster"),
      icon: AlertTriangle,
    },
    { id: "local", label: t("news:categories.local"), icon: MapPin },
    { id: "weather", label: t("news:categories.weather"), icon: CloudRain },
  ];

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-700 border-red-200";
      case "environment":
        return "bg-green-100 text-green-700 border-green-200";
      case "disaster":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "local":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "weather":
        return "bg-sky-100 text-sky-700 border-sky-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find((cat) => cat.id === category);
    return categoryData?.icon || Newspaper;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = categories.find((cat) => cat.id === category);
    return (
      categoryData?.label ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  const handleArticleClick = (article: NewsArticle) => {
    // Open article in a new tab
    if (article.url) {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          {t("news:allNews")}
        </h2>
        <p className="text-neutral-600">{t("common:loading.default")}</p>
      </div>
    );
  }

  return (
    <div className="hazard-card max-w-6xl mx-auto bg-white text-neutral-900 p-6 text-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Newspaper className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {t("news:allNews")}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700"
          >
            {t("common:back")}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const count =
            category.id === "all"
              ? articles.length
              : articles.filter((a) => a.category === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-sky-100 text-sky-700 border border-sky-200"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
              <span className="card-bg px-2 py-0.5 rounded-full text-xs">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const CategoryIcon = getCategoryIcon(article.category);
          return (
            <div
              key={article.id}
              className="p-4 border border-neutral-200 rounded-lg bg-white text-neutral-900 hover:bg-neutral-50 hover:shadow-md hover:-translate-y-0.5 hover:border-sky-700 transition-all duration-200 cursor-pointer group"
              onClick={() => handleArticleClick(article)}
            >
              <div className="flex">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(
                          article.category
                        )}`}
                      >
                        <CategoryIcon className="h-3 w-3 inline mr-1" />
                        {getCategoryLabel(article.category)}
                      </span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-neutral-200 rounded-sm">
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </button>
                  </div>

                  <h4 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors duration-200">
                    {article.title}
                  </h4>

                  <p className="text-sm text-neutral-600 mb-3 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-neutral-700">
                        {article.source}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      {article.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{article.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8">
          <Newspaper className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">{t("news:noArticles")}</p>
        </div>
      )}
    </div>
  );
};

export default AllNewsPage;
