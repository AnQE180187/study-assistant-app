import axios from "axios";
import api from "./api";

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  avatar?: string;
}

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post("/users/login", { email, password });
  return res.data;
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post("/users", { name, email, password });
  return res.data;
};

export const loginWithGoogle = async (
  accessToken: string
): Promise<AuthResponse> => {
  const res = await api.post("/users/google-login", { accessToken });
  return res.data;
};

export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const res = await api.post("/users/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  const res = await api.post("/users/reset-password", {
    email,
    token,
    newPassword,
  });
  return res.data;
};

export const getProfile = async (
  token: string
): Promise<{
  id: string;
  name: string;
  email: string;
  education?: string;
  role: string;
  createdAt: string;
}> => {
  const res = await api.get("/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const sendOtp = async (email: string, forceRealAPI = false) => {
  console.log("🌐 Attempting to send OTP to:", email);
  console.log("🔗 API URL:", api.defaults.baseURL + "/users/send-otp");
  console.log("🎯 Force Real API:", forceRealAPI);

  try {
    // Create a public API instance without token for OTP endpoint
    const publicApi = axios.create({
      baseURL: api.defaults.baseURL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Try different possible endpoints directly
    let response;
    const endpoints = [
      "/users/send-otp",
      "/auth/send-otp",
      "/send-otp",
      "/users/register/send-otp",
      "/auth/register/send-otp",
      "/register/send-otp",
      "/otp/send",
      "/auth/otp/send",
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`);
        response = await publicApi.post(endpoint, { email });
        console.log(`✅ Success with endpoint: ${endpoint}`);
        console.log(`📧 Response:`, response.data);
        break;
      } catch (endpointError: any) {
        console.log(
          `❌ Failed with ${endpoint}:`,
          endpointError.response?.status,
          endpointError.response?.data?.message || endpointError.message
        );
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw endpointError; // Throw error from last attempt
        }
      }
    }

    console.log("✅ Real OTP sent successfully:", response.data);
    console.log("📧 Check your email for the OTP code!");
    return response.data;
  } catch (error: any) {
    console.error("❌ Real API failed:");
    console.error("   Status:", error.response?.status);
    console.error("   Data:", error.response?.data);
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);

    // Check if it's a network error or API endpoint issue
    const isNetworkError = !error.response || error.code === "NETWORK_ERROR";
    const isEndpointError = error.response?.status === 404;

    if (isNetworkError) {
      console.log("🌐 Network error detected - backend may be down");
    } else if (isEndpointError) {
      console.log("🔍 Endpoint not found - /users/send-otp may not exist");
    }

    // Only fallback to mock in development when API fails AND forceRealAPI is false
    if (__DEV__ && !forceRealAPI) {
      console.log("🔄 Development mode: Using simulated OTP");
      console.log("💡 Use OTP: 607569 to continue");
      console.log("📝 Note: Real API failed, using mock for development");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "OTP sent successfully (simulated - API unavailable)",
        otp: "607569",
      };
    }

    // If forceRealAPI is true or in production, throw the error
    console.log("🚫 Force Real API is enabled - not using fallback");
    throw error;
  }
};

export const verifyOtpAndRegister = async (registrationData: {
  email: string;
  otp: string;
  password: string;
  name: string;
  education?: string;
  gender?: string;
  dateOfBirth?: string;
}) => {
  const { email, otp } = registrationData;

  // In development mode, always use mock for OTP 607569
  if (__DEV__ && otp === "607569") {
    console.log(
      "Development mode: Simulating successful registration for:",
      email
    );
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      message: "Registration successful (simulated)",
      user: { email, name: registrationData.name || "Test User" },
    };
  }

  try {
    console.log("Verifying OTP and registering:", {
      email,
      otp: otp.substring(0, 3) + "***",
      name: registrationData.name,
      hasEducation: !!registrationData.education,
      hasGender: !!registrationData.gender,
      hasDateOfBirth: !!registrationData.dateOfBirth,
    });

    const response = await api.post("/users/verify-otp", registrationData);
    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyOtpForgot = async (
  email: string,
  otp: string
): Promise<{ message: string }> => {
  const res = await api.post("/users/verify-otp-forgot", { email, otp });
  return res.data;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  education?: string;
  role: string;
  language: string;
  theme: string;
  createdAt: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  console.log("🔄 Fetching user profile from server...");
  const res = await api.get("/users/profile");
  console.log("✅ User profile fetched:", res.data);
  return res.data;
};

export const updateProfile = async (data: {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  education?: string;
  avatar?: string;
}): Promise<UserProfile> => {
  console.log("🔄 Updating profile with data:", data);
  const res = await api.put("/users/profile", data);
  console.log("✅ Profile updated successfully:", res.data);
  return res.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const res = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};

export const updateLanguage = async (
  language: "vi" | "en"
): Promise<{ id: string; language: string }> => {
  const res = await api.put("/users/language", { language });
  return res.data;
};

export const updateTheme = async (
  theme: "light" | "dark"
): Promise<{ id: string; theme: string }> => {
  const res = await api.put("/users/theme", { theme });
  return res.data;
};
