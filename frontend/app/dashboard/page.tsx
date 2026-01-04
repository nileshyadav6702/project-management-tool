"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  totalTeams: number;
  activeTeams: number;
  projectsByStatus: Record<string, number>;
}

interface Activity {
  _id: string;
  type: string;
  userName: string;
  userAvatar?: string;
  description: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
  deadline: string;
  teamId?: { name: string };
  teamMembers?: { name: string; avatar?: string }[];
}

const statusColors: Record<string, { bg: string; text: string; bar: string }> = {
  "planning": { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  "in-progress": { bg: "bg-yellow-50", text: "text-yellow-700", bar: "bg-yellow-500" },
  "on-hold": { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" },
  "completed": { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  "cancelled": { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
};

const activityColors: Record<string, string> = {
  project_created: "bg-blue-500",
  task_completed: "bg-green-500",
  comment_added: "bg-purple-500",
  payment_updated: "bg-yellow-500",
  team_updated: "bg-gray-500",
};

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
    enabled: mounted,
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const res = await api.get("/dashboard/activities");
      return res.data;
    },
    enabled: mounted,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["dashboard-projects"],
    queryFn: async () => {
      const res = await api.get("/projects?limit=5");
      return res.data;
    },
    enabled: mounted,
  });

  if (!mounted) return null;

  const totalProjects = stats?.totalProjects || 0;
  const statusData = [
    { label: "Active Development", count: stats?.projectsByStatus?.["in-progress"] || 0, color: "bg-blue-500" },
    { label: "Completed", count: stats?.projectsByStatus?.completed || 0, color: "bg-green-500" },
    { label: "Pending Review", count: stats?.projectsByStatus?.["on-hold"] || 0, color: "bg-orange-500" },
    { label: "Overdue", count: 0, color: "bg-red-500" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "MMM d, yyyy")}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-green-600 font-medium">+12%</span>
                  </div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-xs text-green-600 font-medium">+4</span>
                  </div>
                  <p className="text-sm text-gray-500">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeTeams || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">0%</span>
                  </div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.reviewTasks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs text-green-600 font-medium">+8%</span>
                  </div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Status Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Project Status Overview</CardTitle>
                <Link href="/projects">
                  <Button variant="link" className="text-blue-600 p-0 h-auto font-bold hover:no-underline group">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-5">
                {statusData.map((item) => (
                  <div 
                    key={item.label} 
                    className="space-y-2 cursor-pointer group/status"
                    onClick={() => {
                      const statusMap: Record<string, string> = {
                        "Active Development": "in-progress",
                        "Completed": "completed",
                        "Pending Review": "on-hold",
                        "Overdue": "all"
                      };
                      router.push(`/projects?status=${statusMap[item.label]}`);
                    }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 group-hover/status:text-gray-900 transition-colors">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.count} Projects</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500 group-hover/status:brightness-110`}
                        style={{ width: `${totalProjects ? (item.count / totalProjects) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="pb-3">Project Name</th>
                        <th className="pb-3">Team Lead</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projects?.slice(0, 3).map((project) => (
                        <tr key={project._id} className="text-sm">
                          <td className="py-3">
                            <p className="font-medium text-gray-900">{project.name}</p>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-[10px]">
                                {project.teamMembers?.[0]?.avatar ? (
                                  <img src={project.teamMembers[0].avatar} alt={project.teamMembers[0].name} className="w-full h-full object-cover" />
                                ) : (
                                  project.teamMembers?.[0]?.name?.charAt(0) || "U"
                                )}
                              </div>
                              <span className="text-gray-600">{project.teamMembers?.[0]?.name || "Unassigned"}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusColors[project.status]?.bg || "bg-gray-100"
                            } ${statusColors[project.status]?.text || "text-gray-700"}`}>
                              {project.status?.replace("-", " ")}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600">
                            {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline"}
                          </td>
                        </tr>
                      ))}
                      {(!projects || projects.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            No upcoming deadlines
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex gap-3">
                    <div className="relative">
                      <div className={`w-2 h-2 rounded-full absolute -left-1 top-2 z-10 border border-white ${
                        activityColors[activity.type] || "bg-gray-400"
                      }`}></div>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                        {activity.userAvatar ? (
                          <img src={activity.userAvatar} alt={activity.userName} className="w-full h-full object-cover" />
                        ) : (
                          activity.userName?.charAt(0) || "U"
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
