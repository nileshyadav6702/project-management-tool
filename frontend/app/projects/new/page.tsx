"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Users,
  X,
  Briefcase,
  FileText,
  Flag,
  DollarSign,
  Building2,
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
import Link from "next/link";

interface Team {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Get first two letters of name in uppercase
const getInitials = (name: string | undefined): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    teamId: "",
    teamMembers: [] as string[],
    budget: 0,
    deadline: "",
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await api.get("/teams");
      return res.data;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty values that would cause MongoDB cast errors
    const submitData: Record<string, unknown> = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      budget: formData.budget,
    };
    
    // Only include teamId if it's not empty
    if (formData.teamId) {
      submitData.teamId = formData.teamId;
    }
    
    // Only include teamMembers if there are any
    if (formData.teamMembers.length > 0) {
      submitData.teamMembers = formData.teamMembers;
    }
    
    // Only include deadline if it's set
    if (formData.deadline) {
      submitData.deadline = formData.deadline;
    }
    
    createMutation.mutate(submitData as typeof formData);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-gray-200 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-gray-500 mt-0.5">
                Fill in the details to set up your new project
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button variant="outline" className="h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !formData.name.trim()}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {createMutation.isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 font-medium">
              Failed to create project. Please try again.
            </p>
          </div>
        )}

        {/* Form Content - Full Width Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                    <p className="text-sm text-gray-500">Project name and description</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Project Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                      required
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the project goals and objectives..."
                      rows={5}
                      className="flex w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Assignment Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Team Assignment</h3>
                    <p className="text-sm text-gray-500">Assign team and members to this project</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Team Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Assign Team
                    </Label>
                    <Select
                      value={formData.teamId}
                      onValueChange={(v) => setFormData({ ...formData, teamId: v })}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {teams?.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">No teams available</div>
                        ) : (
                          teams?.map((team) => (
                            <SelectItem key={team._id} value={team._id} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {team.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Team Members</span>
                      {formData.teamMembers.length > 0 && (
                        <span className="text-xs font-normal text-gray-500">
                          {formData.teamMembers.length} selected
                        </span>
                      )}
                    </Label>
                    <Select
                      value=""
                      onValueChange={(userId) => {
                        if (userId && !formData.teamMembers.includes(userId)) {
                          setFormData({
                            ...formData,
                            teamMembers: [...formData.teamMembers, userId]
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Add team members" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-48">
                        {users?.filter(user => !formData.teamMembers.includes(user._id)).length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {users?.length === 0 ? "No users available" : "All users added"}
                          </div>
                        ) : (
                          users?.filter(user => !formData.teamMembers.includes(user._id)).map((user) => (
                            <SelectItem key={user._id} value={user._id} className="cursor-pointer py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(user.name || user.email)
                                  )}
                                </div>
                                <span className="text-sm">{user.name || user.email}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Members */}
                {formData.teamMembers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-3">SELECTED MEMBERS</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.teamMembers.map((memberId) => {
                        const user = users?.find(u => u._id === memberId);
                        if (!user) return null;
                        return (
                          <div
                            key={memberId}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-[9px] font-semibold">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                getInitials(user.name || user.email)
                              )}
                            </div>
                            <span className="text-gray-700">{user.name || user.email}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                teamMembers: formData.teamMembers.filter(id => id !== memberId)
                              })}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Status & Priority Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Flag className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Status & Priority</h3>
                    <p className="text-sm text-gray-500">Project tracking settings</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="planning" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Planning
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="on-hold" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            On Hold
                          </div>
                        </SelectItem>
                        <SelectItem value="completed" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => setFormData({ ...formData, priority: v })}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="low" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Budget & Timeline</h3>
                    <p className="text-sm text-gray-500">Financial and scheduling</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                      Budget
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                        className="h-11 pl-7 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">
                      Deadline
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Quick Tips</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Use clear, descriptive project names</li>
                      <li>• Set realistic deadlines for better planning</li>
                      <li>• Assign team members early for visibility</li>
                    </ul>
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
