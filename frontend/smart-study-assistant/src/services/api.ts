import axios from "axios";
import { Platform } from "react-native";

// Auto-detect the best API URL based on environment
const getApiBaseUrl = () => {
  // For production, use production server
  if (__DEV__ === false) {
    return "https://study-assitant-app-backend.onrender.com/api";
  }

  // For development - prioritize real device IP for all platforms
  // Since you're using Expo Go on real device, use network IP
  console.log("🔍 Platform detected:", Platform.OS);
  console.log("🔍 Development mode:", __DEV__);

  // Always use network IP for real devices (Expo Go)
  const networkIP = "http://10.0.2.2:5000/api";
  console.log("🌐 Using network IP:", networkIP);

  return networkIP;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để lưu token hiện tại
let currentToken: string | null = null;

// Hàm để cập nhật token (sẽ được gọi từ AuthContext)
export const setAuthToken = (token: string | null) => {
  currentToken = token;
  console.log("Token updated:", token ? "Token set" : "Token cleared");
};

// Request interceptor để tự động thêm token
api.interceptors.request.use(
  (config) => {
    console.log(
      "🚀 Making request to:",
      (config.baseURL || "") + (config.url || "")
    );
    console.log("🚀 Method:", config.method?.toUpperCase());
    console.log("🚀 Headers:", config.headers);

    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
      console.log("🔐 Request with token:", config.url);
    } else {
      console.log("🔓 Request without token:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Fallback URLs to try if primary fails
const fallbackUrls = [
  "http://192.168.1.41:5000/api", // Home network
  "http://10.12.3.169:5000/api", // FU Network
  "http://localhost:5000/api", // Localhost
  "http://10.0.2.2:5000/api", // Android emulator
];

let currentFallbackIndex = 0;

// Response interceptor để xử lý lỗi chung và fallback
api.interceptors.response.use(
  (response) => {
    console.log(
      "✅ API Success:",
      response.config.baseURL,
      response.config.url,
      response.status
    );
    // Reset fallback index on successful request
    currentFallbackIndex = 0;
    return response;
  },
  async (error) => {
    console.error(
      "❌ API Error:",
      error.config?.baseURL,
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    // Network error - try fallback URLs
    if (
      !error.response &&
      __DEV__ &&
      currentFallbackIndex < fallbackUrls.length - 1
    ) {
      currentFallbackIndex++;
      const fallbackUrl = fallbackUrls[currentFallbackIndex];
      console.log(
        `🔄 Trying fallback URL ${currentFallbackIndex}: ${fallbackUrl}`
      );

      // Update base URL and retry
      api.defaults.baseURL = fallbackUrl;
      return api.request(error.config);
    }

    // Network error
    if (!error.response) {
      console.error("🌐 Network error - no response received");
      error.code = "NETWORK_ERROR";
      error.message =
        "Cannot connect to server. Please check if backend is running.";
    }

    // Server errors
    if (error.response?.status >= 500) {
      console.error("🔥 Server error:", error.response.status);
      error.message = "Server error. Please try again later.";
    }

    // Unauthorized
    if (error.response?.status === 401) {
      console.log("🔐 Unauthorized - token may be expired");
      // TODO: Redirect về login hoặc refresh token
    }

    return Promise.reject(error);
  }
);

export default api;
