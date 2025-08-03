import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../services/authService";
import { setAuthToken } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  education?: string;
  role: string;
  language: string;
  theme: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    // Cập nhật token trong api service khi token thay đổi
    setAuthToken(token);
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      setToken(response.token);
      setUser({
        id: response.id,
        email: response.email,
        name: response.name,
        ...(response.education ? { education: response.education } : {}),
        role: response.role || "USER",
        language: "en",
        theme: "light",
        createdAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: response.id,
          email: response.email,
          name: response.name,
          ...(response.education ? { education: response.education } : {}),
          role: response.role || "USER",
          language: "en",
          theme: "light",
          createdAt: new Date().toISOString(),
        })
      );
    } catch (error: any) {
      Alert.alert(
        "Lỗi đăng nhập",
        error.message || "Có lỗi xảy ra khi đăng nhập"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const response = await authService.loginWithGoogle(accessToken);

      setToken(response.token);
      setUser({
        id: response.id,
        email: response.email,
        name: response.name,
        avatar: response.avatar,
        role: response.role || "USER",
        language: "en",
        theme: "light",
        createdAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: response.id,
          email: response.email,
          name: response.name,
          avatar: response.avatar,
          role: response.role || "USER",
          language: "en",
          theme: "light",
          createdAt: new Date().toISOString(),
        })
      );
    } catch (error: any) {
      Alert.alert(
        "Lỗi đăng nhập Google",
        error.message || "Có lỗi xảy ra khi đăng nhập với Google"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register(name, email, password);

      setToken(response.token);
      setUser({
        id: response.id,
        email: response.email,
        name: response.name,
        ...(response.education ? { education: response.education } : {}),
        role: response.role || "USER",
        language: "en",
        theme: "light",
        createdAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: response.id,
          email: response.email,
          name: response.name,
          ...(response.education ? { education: response.education } : {}),
          role: response.role || "USER",
          language: "en",
          theme: "light",
          createdAt: new Date().toISOString(),
        })
      );
    } catch (error: any) {
      Alert.alert("Lỗi đăng ký", error.message || "Có lỗi xảy ra khi đăng ký");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      Alert.alert("Thành công", "Email đặt lại mật khẩu đã được gửi");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi gửi email");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      if (!token) {
        console.log("❌ No token available for refreshing profile");
        return;
      }

      console.log("🔄 Refreshing user profile from server...");
      const profile = await authService.getUserProfile();
      console.log("✅ Fresh profile data received:", profile);

      const updatedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        education: profile.education,
        role: profile.role,
        language: profile.language,
        theme: profile.theme,
        createdAt: profile.createdAt,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ User profile updated in context and storage");
    } catch (error) {
      console.error("❌ Error refreshing user profile:", error);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        register,
        forgotPassword,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
