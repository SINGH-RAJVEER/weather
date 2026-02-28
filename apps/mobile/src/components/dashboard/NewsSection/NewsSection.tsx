import {
  AlertCircle,
  BarChart3,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Newspaper,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

// props: { articles, isLoading }
export default function NewsSection({ articles = [], isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { id: "all", label: "All News", icon: Newspaper },
    { id: "breaking", label: "Breaking", icon: AlertCircle },
    { id: "update", label: "Updates", icon: TrendingUp },
    { id: "advisory", label: "Advisory", icon: FileText },
    { id: "analysis", label: "Analysis", icon: BarChart3 },
  ];

  const filteredArticles =
    selectedCategory === "all" ? articles : articles.filter((a) => a.category === selectedCategory);

  const displayedArticles = showAll ? filteredArticles : filteredArticles.slice(0, 4);

  const getCategoryColor = (category) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-700 border-red-200";
      case "update":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "advisory":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "analysis":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="p-4">
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <Newspaper size={24} color="#2563eb" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-neutral-900">Latest News & Updates</Text>
            <Text className="text-sm text-neutral-600">
              Real-time incident coverage and official advisories
            </Text>
          </View>
        </View>

        {/* Category Pills */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const count =
                category.id === "all"
                  ? articles.length
                  : articles.filter((a) => a.category === category.id).length;

              const isSelected = selectedCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`flex-row items-center px-4 py-2 mr-3 rounded-full border ${
                    isSelected ? "bg-sky-100 border-sky-300" : "bg-neutral-50 border-neutral-200"
                  }`}
                >
                  <Icon size={16} color={isSelected ? "#0369a1" : "#374151"} />
                  <Text
                    className={`ml-2 text-sm ${
                      isSelected ? "text-sky-700 font-semibold" : "text-neutral-700"
                    }`}
                  >
                    {category.label}
                  </Text>
                  <Text className="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Articles */}
        {displayedArticles.map((article) => {
          const _CategoryIcon =
            categories.find((c) => c.id === article.category)?.icon || Newspaper;

          return (
            <View
              key={article.id}
              className="border border-neutral-200 rounded-lg p-4 mb-4 bg-white"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                  <Text
                    className={`text-xs px-2 py-1 mr-2 rounded-full border ${getCategoryColor(
                      article.category
                    )}`}
                  >
                    {article.category}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {Math.round(article.relevanceScore * 100)}% relevant
                  </Text>
                </View>
                {article.url && (
                  <TouchableOpacity onPress={() => Linking.openURL(article.url)}>
                    <ExternalLink size={16} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              <Text className="font-semibold text-neutral-900 mb-2">{article.title}</Text>
              <Text className="text-sm text-neutral-600 mb-3">{article.summary}</Text>

              <View className="flex-row flex-wrap items-center">
                <Text className="font-medium text-neutral-700 mr-3">{article.source}</Text>
                <View className="flex-row items-center mr-3">
                  <Clock size={12} color="#6b7280" />
                  <Text className="ml-1 text-xs text-neutral-500">{article.publishedAt}</Text>
                </View>
                {article.location && (
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#6b7280" />
                    <Text className="ml-1 text-xs text-neutral-500">{article.location}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Show more / less */}
        {filteredArticles.length > 4 && (
          <View className="mt-6 items-center">
            <TouchableOpacity
              onPress={() => setShowAll(!showAll)}
              className="px-6 py-2 bg-sky-500 rounded-lg"
            >
              <Text className="text-white font-medium">
                {showAll ? "Show Less" : `View All ${filteredArticles.length} Articles`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {filteredArticles.length === 0 && (
          <View className="items-center py-8">
            <Newspaper size={48} color="#d1d5db" />
            <Text className="text-neutral-500 mt-2">
              No news articles found for the selected category.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
