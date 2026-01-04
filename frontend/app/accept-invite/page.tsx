"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "text-purple-600", bg: "bg-purple-50" },
  manager: { label: "Manager", color: "text-blue-600", bg: "bg-blue-50" },
  member: { label: "Member", color: "text-green-600", bg: "bg-green-50" },
  viewer: { label: "Viewer", color: "text-gray-600", bg: "bg-gray-50" },
};

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch invitation details
  const { data: invitation, isLoading, error: fetchError } = useQuery<{
    email: string;
    name: string;
    role: string;
  }>({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const res = await api.get(`/invitations/token/${token}`);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
        invitationToken: token,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Google authentication failed");
    }
  };

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post("/invitations/accept", data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      setError(err.response?.data?.error || "Failed to accept invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid invitation token");
      return;
    }

    acceptMutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-600">
              This invitation link is invalid. Please check your email for the correct link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="p-8 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
            <p className="text-gray-600">
              This invitation may have expired or already been used.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600">
              Your account is ready. Redirecting...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const role = roleConfig[invitation.role] || roleConfig.member;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to ProjectHub</h1>
            <p className="text-gray-600 mt-2">Complete your account setup</p>
          </div>

          {/* Invitation Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {invitation.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{invitation.name}</p>
                <p className="text-sm text-gray-600">{invitation.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">You&apos;ll join as a</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${role.bg} ${role.color}`}>
                {role.label}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed")}
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
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wide">Or set a password</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  value={invitation.email}
                  disabled
                  className="h-11 pl-10 bg-gray-100 border-gray-200 text-gray-600"
                />
              </div>
            </div>

            {/* Name (Read Only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={invitation.name}
                  disabled
                  className="h-11 pl-10 bg-gray-100 border-gray-200 text-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Create Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  className="h-11 pl-10 border-gray-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={acceptMutation.isPending}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {acceptMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="p-8 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
