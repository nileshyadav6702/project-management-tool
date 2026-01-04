"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  teamId: { _id: string; name: string } | null;
  teamMembers: Array<{ _id: string; name: string; email: string; avatar?: string }>;
  budget: number;
  progress?: number;
  createdAt: string;
}

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

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  "planning": { label: "Planning", bg: "bg-slate-100", text: "text-slate-700" },
  "in-progress": { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700" },
  "on-hold": { label: "On Hold", bg: "bg-orange-100", text: "text-orange-700" },
  "completed": { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
  "cancelled": { label: "Cancelled", bg: "bg-red-100", text: "text-red-700" },
};

const progressColors: Record<string, string> = {
  "in-progress": "bg-blue-500",
  "completed": "bg-green-500",
  "on-hold": "bg-orange-500",
  "planning": "bg-slate-400",
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

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialStatus = searchParams?.get("status") || "all";
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  useState(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({ id: parsed.id || parsed._id, role: parsed.role });
    }
  });

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";
  

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const res = await api.get(`/projects?${params}`);
      return res.data;
    },
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
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData & { id: string }) =>
      api.put(`/projects/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "planning",
      priority: "medium",
      teamId: "",
      teamMembers: [],
      budget: 0,
      deadline: "",
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      teamId: project.teamId?._id || "",
      teamMembers: project.teamMembers?.map(m => m._id) || [],
      budget: project.budget || 0,
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ ...formData, id: editingProject._id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getProgress = (project: Project) => {
    if (project.status === "completed") return 100;
    if (project.status === "in-progress") return Math.floor(Math.random() * 40 + 30);
    if (project.status === "on-hold") return Math.floor(Math.random() * 30 + 10);
    return Math.floor(Math.random() * 20);
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil((projects?.length || 0) / itemsPerPage);
  const paginatedProjects = projects?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">
              Manage your ongoing initiatives and track progress
            </p>
          </div>
          {isAdminOrManager && (
            <Link href="/projects/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
                {["all", "in-progress", "on-hold", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      statusFilter === status
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {status === "all" ? "All" : status === "in-progress" ? "Active" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 lg:ml-auto">
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort:</span>
                  <Select defaultValue="deadline">
                    <SelectTrigger className="w-36 border-gray-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex border border-gray-200 rounded-xl overflow-hidden ml-auto lg:ml-0">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 ${viewMode === "list" ? "bg-gray-100" : "bg-white"}`}
                  >
                    <List className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 ${viewMode === "grid" ? "bg-gray-100" : "bg-white"}`}
                  >
                    <LayoutGrid className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Project Name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Team
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Deadline
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Progress
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedProjects?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects?.map((project, index) => {
                      const progress = getProgress(project);
                      return (
                        <tr key={project._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <Link href={`/projects/${project._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                                {project.name}
                              </Link>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {project.description || "No description"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {project.teamMembers?.slice(0, 3).map((member) => (
                                  <div
                                    key={member._id}
                                    className="w-7 h-7 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-blue-600 text-white text-[10px] font-semibold"
                                    title={member.name || member.email}
                                  >
                                    {member.avatar ? (
                                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                      getInitials(member.name || member.email)
                                    )}
                                  </div>
                                ))}
                              </div>
                              {project.teamMembers?.length > 3 && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  +{project.teamMembers.length - 3}
                                </span>
                              )}
                              {(!project.teamMembers || project.teamMembers.length === 0) && (
                                <span className="text-xs text-gray-400">No members</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                statusConfig[project.status]?.bg || "bg-gray-100"
                              } ${statusConfig[project.status]?.text || "text-gray-700"}`}
                            >
                              {statusConfig[project.status]?.label || project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {project.deadline
                                ? format(new Date(project.deadline), "MMM d, yyyy")
                                : "TBD"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    progressColors[project.status] || "bg-gray-400"
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/projects/${project._id}`)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2 text-gray-400" />
                                  View
                                </DropdownMenuItem>
                                {isAdminOrManager && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/projects/${project._id}/edit`)}
                                      className="cursor-pointer"
                                    >
                                      <Pencil className="h-4 w-4 mr-2 text-gray-400" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this project?")) {
                                          deleteMutation.mutate(project._id);
                                        }
                                      }}
                                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">1-{Math.min(itemsPerPage, projects?.length || 0)}</span> of{" "}
                <span className="font-medium">{projects?.length || 0}</span> projects
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-blue-100" : ""}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
