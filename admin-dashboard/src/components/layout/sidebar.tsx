"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Brain,
  LogOut,
  Shield,
  Settings,
  BarChart3,
  FileText,
  Zap,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Người dùng",
    href: "/users",
    icon: Users,
    badge: "19",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: BookOpen,
    badge: "525",
    color: "from-purple-500 to-violet-500",
  },
  {
    name: "Ghi chú",
    href: "/notes",
    icon: FileText,
    badge: "14",
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "AI Logs",
    href: "/ai-logs",
    icon: Brain,
    badge: "New",
    color: "from-pink-500 to-rose-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-yellow-800" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-white">
              Study Assistant
            </span>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-12 rounded-xl transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-purple-500/25`
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 z-10 relative" />
                  <span className="z-10 relative font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge
                      className={cn(
                        "ml-auto z-10 relative text-xs",
                        isActive
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-slate-600 text-slate-200 border-slate-500"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                  )}
                </Button>
                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-600/0 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              Admin
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 h-10 rounded-lg"
          >
            <Settings className="mr-3 h-4 w-4" />
            Cài đặt
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 rounded-lg"
            onClick={logout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
