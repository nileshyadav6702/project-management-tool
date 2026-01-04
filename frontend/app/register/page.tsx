"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowUpRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    agreeTerms: false,
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
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, text: "", color: "" };
    if (password.length < 6) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { level: 2, text: "Medium", color: "bg-yellow-500" };
    return { level: 3, text: "Strong", color: "bg-green-500" };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900">ProjectHub</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Already have an account?</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Account</h1>
              <p className="text-gray-500">
                Start managing your team, assigning tasks, and tracking payments seamlessly.
              </p>
            </div>

            {/* Google Login Button */}
            <div className="mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google registration failed")}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-500 uppercase tracking-wide">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11 bg-white border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11 bg-white border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName" className="text-gray-700">Organization Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Acme Corp"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="pl-10 h-11 bg-white border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@company.com"
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
                  {formData.password && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`w-6 h-1.5 rounded-full ${
                              level <= strength.level ? strength.color : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${
                        strength.level === 3 ? "text-green-600" : 
                        strength.level === 2 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {strength.text}
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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
                <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 h-11 bg-white border-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>.
                </label>
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
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-800 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-8 right-8">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-white/90">Trusted by 10,000+ admins</span>
          </div>

          {/* Testimonial Quote */}
          <blockquote className="text-3xl font-semibold text-white leading-relaxed mb-8">
            &ldquo;This tool revolutionized how we manage project payments and team deadlines.&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full"></div>
            <div>
              <p className="text-white font-semibold">Sarah Jenkins</p>
              <p className="text-white/60 text-sm">Operations Director, TechFlow</p>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
