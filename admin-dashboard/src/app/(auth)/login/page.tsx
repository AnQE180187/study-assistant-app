"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import {
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  BookOpen,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Đăng nhập thất bại";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BookOpen className="absolute top-20 left-20 w-8 h-8 text-white/20 animate-bounce" />
        <GraduationCap className="absolute top-40 right-32 w-10 h-10 text-white/20 animate-bounce delay-1000" />
        <Sparkles className="absolute bottom-40 left-32 w-6 h-6 text-white/20 animate-bounce delay-2000" />
        <Shield className="absolute bottom-20 right-20 w-8 h-8 text-white/20 animate-bounce delay-3000" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center shadow-2xl mb-6 relative">
              <BookOpen className="w-12 h-12 text-white" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
              Study Assistant
            </h1>
            <p className="text-purple-200 text-xl font-medium">
              Admin Dashboard
            </p>
            <p className="text-purple-300 text-sm mt-2">
              Quản lý hệ thống học tập thông minh
            </p>
          </div>

          {/* Login Card */}
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Đăng nhập
              </CardTitle>
              <CardDescription className="text-purple-200">
                Nhập thông tin để truy cập hệ thống quản trị
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-white"
                  >
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      {...register("email")}
                      className={`pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200 rounded-xl ${
                        errors.email
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400 mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-white"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-purple-200 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className={`pl-12 pr-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200 rounded-xl ${
                        errors.password
                          ? "border-red-400 focus:border-red-400"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400 mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-3 h-5 w-5" />
                      Đăng nhập
                    </>
                  )}
                </Button>
              </form>

              {/* Debug Info - Only show in development */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/10">
                  <p className="text-xs text-purple-200 mb-2">
                    <strong>🔧 Debug Info:</strong>
                  </p>
                  <div className="text-xs text-purple-300 space-y-1">
                    <p>📧 Email: admin@example.com</p>
                    <p>🔑 Password: admin123</p>
                    <p>
                      🌐 API:{" "}
                      {process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:5000/api"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-purple-300 text-sm">
              © 2024 Study Assistant. Bảo mật và tin cậy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
