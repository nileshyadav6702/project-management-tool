"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Users, DollarSign, Clock, ChevronRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      if (response.data.user.role === "member") {
        router.push("/my-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      if (response.data.user.role === "member") {
        router.push("/my-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900">ProjectHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Contact Support
            </Link>
            <Button variant="outline" size="sm">
              Request Demo
            </Button>
          </div>
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-500">
                Enter your credentials to access your admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11 bg-white border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-11 bg-white border-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login failed")}
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Preview Card */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Preview Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Engineering Team</h3>
                  <p className="text-sm text-gray-500">12 Active Projects</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                <p className="text-xl font-bold text-gray-900">$124,500</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Deadlines</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-gray-900">3</p>
                  <span className="text-xs text-orange-600 font-medium">Urgent</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Recent Activity</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sarah assigned a task</p>
                      <p className="text-xs text-gray-500">2 mins ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mike updated payment</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Build teams, assign deadlines, and handle payments.
            </h2>
            <p className="text-gray-600 mb-6">
              All the tools you need to manage your projects efficiently in one secure place. Join 10,000+ admins managing their workflows.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-blue-600" />
                Bank-grade Security
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                99.9% Uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
