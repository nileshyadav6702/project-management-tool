"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, User, Shield, Send } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

export default function InviteMemberPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member",
  });

  const [formError, setFormError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/invitations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      router.push("/invite");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      setFormError(error.response?.data?.error || "Failed to send invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-lg border-gray-200 hover:bg-gray-50"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invite Team Member</h1>
            <p className="text-gray-500 mt-1">
              Add a new member to your organization and assign their role.
            </p>
          </div>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-lg font-semibold text-gray-900">Invitation Details</CardTitle>
            <CardDescription>
              The invited member will receive an email with their login credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Assign Role
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="member" className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">Member</span>
                          <span className="text-xs text-gray-500">Can view and update assigned tasks</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="manager" className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">Manager</span>
                          <span className="text-xs text-gray-500">Can manage projects and assign tasks</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">Admin</span>
                          <span className="text-xs text-gray-500">Full access to all features and settings</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 h-11 border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all"
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Security Note</p>
            <p className="leading-relaxed opacity-90">
              Invitations are valid for 7 days. If the member doesn't accept within this period, you'll need to resend the invitation from the Team Management page.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
