"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const res = await api.put(`/users/${user._id || user.id}`, {
        name: user.name,
        email: user.email,
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.error || "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 text-lg">Manage your personal information and account details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200 overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <CardContent className="relative pt-0 pb-8 px-6 text-center">
                <div className="relative -mt-12 mb-4 inline-block">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white p-1 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-lg border-2 border-white shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-2 uppercase tracking-wider">
                  {user.role}
                </p>
                
                <div className="mt-8 space-y-4 text-left border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">{user.role} Access</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Security Level</span>
                  <span className="text-sm font-bold text-gray-900">Standard</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Edit Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Update your basic account details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                      <Input
                        id="name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="h-11 border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="h-11 border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl"
                        placeholder="yourname@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Professional Bio</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="Write a short bio about your role and expertise..."
                    />
                  </div>

                  {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${
                      message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                      <span className="font-medium">{message.text}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      {isSaving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-100 pb-6 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle>Organization Details</CardTitle>
                </div>
                <CardDescription>Information about your current workplace and role.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Organization</p>
                    <p className="text-base font-bold text-gray-900">{user.organizationId?.name || "Personal Account"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Role</p>
                    <p className="text-base font-bold text-gray-900 capitalize">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
