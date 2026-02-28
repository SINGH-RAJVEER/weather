import { Lock, Mail, User, Waves } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "citizen",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && !formData.name) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(
          formData.email,
          formData.password,
          formData.name,
          formData.role as "citizen" | "official" | "analyst"
        );
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const _fillDemoCredentials = (role) => {
    setFormData({
      email: `${role}@example.com`,
      password: "password",
      name:
        role === "citizen" ? "Demo User" : `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-sky-50">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1 px-4 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center max-w-md w-full mx-auto">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="mb-4">
                <View className="p-3 rounded-2xl bg-sky-500">
                  <Waves size={32} color="white" />
                </View>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">SHORE</Text>
              <Text className="text-gray-600 text-center">Situational Hazard Reporting Engine</Text>
              <Text className="text-sm text-gray-500 mt-2 text-center">
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Create an account to start reporting"}
              </Text>
            </View>

            {/* Form */}
            <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              {!isLogin && (
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
                  <View className="relative">
                    <View
                      className="absolute left-3 top-1/2 z-10"
                      style={{ transform: [{ translateY: -12 }] }}
                    >
                      <User size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Enter your full name"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              )}

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                <View className="relative">
                  <View
                    className="absolute left-3 top-1/2 z-10"
                    style={{ transform: [{ translateY: -12 }] }}
                  >
                    <Mail size={20} color="#9ca3af" />
                  </View>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                <View className="relative">
                  <View
                    className="absolute left-3 top-1/2 z-10"
                    style={{ transform: [{ translateY: -12 }] }}
                  >
                    <Lock size={20} color="#9ca3af" />
                  </View>
                  <TextInput
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: text,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                  />
                </View>
              </View>

              {!isLogin && (
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Role</Text>
                  <View className="flex-row flex-wrap">
                    {[
                      { label: "Citizen Reporter", value: "citizen" },
                      { label: "Government Official", value: "official" },
                      { label: "Data Analyst", value: "analyst" },
                    ].map((role) => (
                      <TouchableOpacity
                        key={role.value}
                        onPress={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                        className={`px-4 py-3 rounded-lg border mr-2 mb-2 ${
                          formData.role === role.value
                            ? "bg-sky-500 border-sky-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            formData.role === role.value ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg ${
                  isLoading ? "bg-gray-400" : "bg-sky-500 active:bg-sky-600"
                }`}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center space-x-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-medium ml-2">Please wait...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-medium text-center text-base">
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>

              <View className="mt-6 items-center">
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </Text>
                  <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="ml-2">
                    <Text className="text-sm text-sky-600 font-medium">
                      {isLogin ? "Sign up" : "Sign in"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Demo credentials */}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
