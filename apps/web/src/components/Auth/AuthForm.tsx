import type { User as UserType } from "@weather/types";
import { Lock, Mail, User, UserCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "citizen" as UserType["role"],
  });
  const { login, register, isLoading } = useAuth();
  const { t } = useTranslation("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name, formData.role);
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary-medium to-primary-light relative overflow-hidden">
      {/* Logo at top left */}
      <div className="absolute top-1 left-8 z-20">
        <img src="/icon.svg" alt="Weather Logo" className="h-40 w-40 drop-shadow-2xl" />
      </div>

      {/* Auth Form */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="card-bg backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100 p-12 w-full max-w-lg text-black">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? t("welcomeBack") : t("joinShore")}
            </h2>
            <p className="text-sm">{isLogin ? t("signInAccess") : t("createAccountAccess")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("fullName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-medium" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-[#61bcc1]/30 rounded-lg focus:ring-2 focus:ring-[#04c4d9] focus:border-[#04c4d9] transition-all duration-200"
                    placeholder={t("enterFullName")}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("role")}</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-medium" />
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as UserType["role"],
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-[#61bcc1]/30 rounded-lg focus:ring-2 focus:ring-[#04c4d9] focus:border-[#04c4d9] transition-all duration-200 appearance-none"
                  >
                    <option value="citizen">{t("roles.citizen")}</option>
                    <option value="official">{t("roles.official")}</option>
                    <option value="analyst">{t("roles.analyst")}</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">{t("emailAddress")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-medium" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-[#61bcc1]/30 rounded-lg focus:ring-2 focus:ring-[#04c4d9] focus:border-[#04c4d9] transition-all duration-200"
                  placeholder={t("enterEmail")}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#03588c]" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-[#61bcc1]/30 rounded-lg focus:ring-2 focus:ring-[#04c4d9] focus:border-[#04c4d9] transition-all duration-200"
                  placeholder={t("enterPassword")}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#03588c] to-[#04c4d9] text-white py-3 px-6 rounded-lg hover:from-[#012340] hover:to-[#03588c] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("pleaseWait")}</span>
                </div>
              ) : isLogin ? (
                t("signIn")
              ) : (
                t("createAccount")
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm">
              {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[#04c4d9] hover:text-[#03588c] font-medium transition-colors"
              >
                {isLogin ? t("signUp") : t("signIn")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
