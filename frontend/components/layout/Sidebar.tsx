"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-dashboard", label: "My Tasks", icon: ClipboardList },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/invite", label: "Invite Members", icon: UserPlus },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help Center", icon: HelpCircle },
];

interface UserInfo {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };


  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out group overflow-hidden",
        isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0 lg:hover:w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className={cn(
              "font-bold text-gray-900 whitespace-nowrap transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
            )}>
              ProjectHub
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems
            .filter((item) => {
              if (user?.role === "member") {
                return ["/my-dashboard", "/projects", "/payments"].includes(item.href);
              }
              return true;
            })
            .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                  <span className={cn(
                    "whitespace-nowrap transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

          <div className="pt-4">
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {bottomItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                    <span className={cn(
                      "whitespace-nowrap transition-opacity duration-300",
                      isOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl hover:bg-white transition-colors cursor-pointer group/user">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-md">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
            )}>
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.name || "Loading..."}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "user@email.com"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
            )}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
