import { BarChart3, Hash, Heart, MessageCircle, TrendingUp, Twitter } from "lucide-react-native";
// src/components/social/SocialMonitor.js
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { formatDate } from "../../utils/utils";

export default function SocialMonitor({ posts, isLoading }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Posts", count: posts.length },
    {
      id: "twitter",
      label: "Twitter",
      count: posts.filter((p) => p.platform === "twitter").length,
    },
    {
      id: "facebook",
      label: "Facebook",
      count: posts.filter((p) => p.platform === "facebook").length,
    },
  ];

  const filteredPosts = activeTab === "all" ? posts : posts.filter((p) => p.platform === activeTab);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-neutral-600 bg-neutral-100";
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "twitter":
        return <Twitter size={16} color="#0284c7" />;
      case "facebook":
        return <MessageCircle size={16} color="#0284c7" />;
      default:
        return <MessageCircle size={16} color="#0284c7" />;
    }
  };

  if (isLoading) {
    return (
      <View className="hazard-card">
        <View className="space-y-4">
          <View className="h-6 bg-neutral-200 rounded-sm w-1/3" />
          <View className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <View key={i} className="p-4 border border-neutral-200 rounded-lg space-y-2">
                <View className="h-4 bg-neutral-200 rounded-sm" />
                <View className="h-3 bg-neutral-200 rounded-sm w-2/3" />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="space-y-6">
      {/* Social Media Stats */}
      <View className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <View className="hazard-card">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp size={24} color="#9333ea" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">Total Mentions</Text>
              <Text className="text-2xl font-bold text-neutral-900">{posts.length}</Text>
            </View>
          </View>
        </View>

        <View className="hazard-card">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 size={24} color="#2563eb" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">Avg. Sentiment</Text>
              <Text className="text-2xl font-bold text-neutral-900">7.2/10</Text>
            </View>
          </View>
        </View>

        <View className="hazard-card">
          <View className="flex-row items-center space-x-3">
            <View className="p-3 bg-green-100 rounded-lg">
              <Hash size={24} color="#16a34a" />
            </View>
            <View>
              <Text className="text-sm font-medium text-neutral-600">Trending Tags</Text>
              <Text className="text-sm font-medium text-green-600">#ChennaiWeather</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Social Media Feed */}
      <View className="hazard-card">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-lg font-semibold text-neutral-900">Social Media Monitor</Text>
          <View className="flex-row items-center bg-neutral-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md ${
                  activeTab === tab.id ? "bg-white shadow-xs" : "text-neutral-600"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.id ? "text-neutral-900" : "text-neutral-600"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="space-y-4">
          {filteredPosts.map((post) => {
            const _PlatformIcon = getPlatformIcon(post.platform);
            return (
              <View key={post.id} className="p-4 border border-neutral-200 rounded-lg">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center space-x-3">
                    <View className="p-2 bg-sky-100 rounded-lg">
                      {getPlatformIcon(post.platform)}
                    </View>
                    <View>
                      <Text className="font-medium text-neutral-900">{post.author}</Text>
                      <Text className="text-xs text-neutral-500">{formatDate(post.timestamp)}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    <Text
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(
                        post.sentiment
                      )}`}
                    >
                      {post.sentiment}
                    </Text>
                    <Text className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {Math.round(post.hazardRelevance * 100)}% relevant
                    </Text>
                  </View>
                </View>

                <Text className="text-neutral-700 mb-4">{post.content}</Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row space-x-4">
                    <View className="flex-row items-center space-x-1">
                      <Heart size={16} color="#6b7280" />
                      <Text>{post.engagement.likes}</Text>
                    </View>
                    <View className="flex-row items-center space-x-1">
                      <MessageCircle size={16} color="#6b7280" />
                      <Text>{post.engagement.comments}</Text>
                    </View>
                    <View className="flex-row items-center space-x-1">
                      <TrendingUp size={16} color="#6b7280" />
                      <Text>{post.engagement.shares}</Text>
                    </View>
                  </View>
                  <Text className="capitalize text-neutral-600">{post.platform}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
