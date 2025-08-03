import api from "./api";
import { User } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post("/users/login", credentials);
    const { token, ...user } = response.data;

    // Kiểm tra role admin
    if (user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Lưu token và user info
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));

    return response.data;
  },

  logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/login";
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const userStr = localStorage.getItem("adminUser");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminToken");
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && user.role === "ADMIN");
  },
};
