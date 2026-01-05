"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Mail,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  RefreshCw,
  User,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import { format } from "date-fns";

interface Invitation {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  expiresAt: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  accepted: { label: "Accepted", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  expired: { label: "Expired", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "text-purple-600", bg: "bg-purple-50" },
  manager: { label: "Manager", color: "text-blue-600", bg: "bg-blue-50" },
  member: { label: "Member", color: "text-green-600", bg: "bg-green-50" },
  viewer: { label: "Viewer", color: "text-gray-600", bg: "bg-gray-50" },
};

// Get first two letters of name in uppercase
const getInitials = (name: string | undefined): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

import { Suspense } from "react";

function InviteContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (searchParams.get("open") === "true") {
      setShowForm(true);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "member",
  });
  const [formError, setFormError] = useState("");

  // Fetch invitations
  const { data: invitations, isLoading } = useQuery<Invitation[]>({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await api.get("/invitations");
      return res.data;
    },
  });

  // Create invitation mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/invitations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setShowForm(false);
      setFormData({ email: "", name: "", role: "member" });
      setFormError("");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      setFormError(error.response?.data?.error || "Failed to send invitation");
    },
  });

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/invitations/${id}/resend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });

  // Delete invitation mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invitations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    createMutation.mutate(formData);
  };

  // Filter invitations
  const filteredInvitations = invitations?.filter(
    (inv) =>
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const pendingCount = invitations?.filter((i) => i.status === "pending").length || 0;
  const acceptedCount = invitations?.filter((i) => i.status === "accepted").length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invite Members</h1>
            <p className="text-gray-500 mt-0.5">Invite new team members to collaborate</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className={`h-10 px-5 ${showForm ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite New Member
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Invitations</p>
                  <p className="text-2xl font-bold text-gray-900">{invitations?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Form */}
        {showForm && (
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Send Invitation</h3>
                  <p className="text-sm text-gray-500">Fill in the details to invite a team member</p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="h-10 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="h-10 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Role</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                      <SelectTrigger className="h-10 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                        <SelectItem value="manager" className="cursor-pointer">Manager</SelectItem>
                        <SelectItem value="member" className="cursor-pointer">Member</SelectItem>
                        <SelectItem value="viewer" className="cursor-pointer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {createMutation.isPending ? (
                      "Sending..."
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
        )}

        {/* Search */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search invitations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invitations List */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : filteredInvitations && filteredInvitations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredInvitations.map((invitation) => {
                  const status = statusConfig[invitation.status] || statusConfig.pending;
                  const role = roleConfig[invitation.role] || roleConfig.member;
                  const StatusIcon = status.icon;
                  const isExpired = new Date(invitation.expiresAt) < new Date() && invitation.status === "pending";

                  return (
                    <div key={invitation._id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(invitation.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-gray-900">{invitation.name}</p>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${role.bg} ${role.color}`}>
                                {role.label}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${isExpired ? statusConfig.expired.bg : status.bg} ${isExpired ? statusConfig.expired.color : status.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {isExpired ? "Expired" : status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{invitation.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Invited on {format(new Date(invitation.createdAt), "MMM d, yyyy")}
                              {invitation.status === "pending" && !isExpired && (
                                <> • Expires {format(new Date(invitation.expiresAt), "MMM d, yyyy")}</>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(invitation.status === "pending" || isExpired) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendMutation.mutate(invitation._id)}
                              disabled={resendMutation.isPending}
                              className="h-8 px-3 border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${resendMutation.isPending ? "animate-spin" : ""}`} />
                              Resend
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this invitation?")) {
                                deleteMutation.mutate(invitation._id);
                              }
                            }}
                            className="h-8 px-3 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No invitations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click &quot;Invite New Member&quot; to send your first invitation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<MainLayout><div className="flex items-center justify-center py-12">Loading...</div></MainLayout>}>
      <InviteContent />
    </Suspense>
  );
}
