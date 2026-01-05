"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  MoreVertical,
  Eye,
  Briefcase,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId?: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  createdAt: string;
}

const taskStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  "todo": { label: "To Do", color: "text-slate-600", bg: "bg-slate-100", icon: Circle },
  "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100", icon: Clock },
  "review": { label: "Review", color: "text-purple-600", bg: "bg-purple-100", icon: AlertCircle },
  "done": { label: "Done", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  "low": { label: "Low", color: "text-gray-600", bg: "bg-gray-100" },
  "medium": { label: "Medium", color: "text-blue-600", bg: "bg-blue-100" },
  "high": { label: "High", color: "text-red-600", bg: "bg-red-100" },
  "urgent": { label: "Urgent", color: "text-red-700", bg: "bg-red-200" },
};

export default function TasksPage() {
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle initial filter from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      if (status === "done") {
        setStatusFilter("completed");
      }
    }
  }, []);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["all-tasks", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      
      // Handle custom filters
      if (statusFilter === "completed") {
        params.append("status", "done");
      } else if (statusFilter === "incomplete") {
        // Since backend might not support "!done" directly, we might need to filter client-side or assume backend logic.
        // For now let's fetch all and filter client side for 'incomplete' if backend doesn't support exclusion easily 
        // OR simply don't pass status and do client side filtering.
        // Let's assume we fetch all and filter client side for 'incomplete' for simpler logic if backend doesn't support negation.
        // However, looking at the task controller, it takes exact matches.
        // Let's rely on client side filtering for 'incomplete' to be safe and robust.
      } else if (statusFilter !== "all") {
         // specific status like 'in-progress' etc if we add more tabs later
         // params.append("status", statusFilter); // Removing this as we only have 3 main tabs for now
      }

      const res = await api.get(`/tasks?${params}`);
      return res.data;
    },
  });

  // Client-side filtering wrapper for "incomplete" since backend API is simple match
  const filteredTasks = tasks?.filter(task => {
    if (statusFilter === "incomplete") return task.status !== "done";
    if (statusFilter === "completed") return task.status === "done";
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil((filteredTasks?.length || 0) / itemsPerPage);
  const paginatedTasks = filteredTasks?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getInitials = (name: string | undefined): string => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-500 mt-1">
              Manage and track all tasks across projects
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Tasks" },
                  { id: "completed", label: "Completed" },
                  { id: "incomplete", label: "Incomplete" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                        setStatusFilter(s.id);
                        setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      statusFilter === s.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

               <div className="flex items-center gap-2 lg:ml-auto">
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

        {/* Tasks List */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredTasks?.length === 0 ? (
                <div className="p-8 text-center">
                    <CheckCircle2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks found</p>
                </div>
            ) : viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Task</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Project</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Priority</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Aisgned To</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Due Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedTasks?.map((task) => {
                      const status = taskStatusConfig[task.status] || taskStatusConfig["todo"];
                      const priority = priorityConfig[task.priority] || priorityConfig["medium"];
                      
                      return (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Link href={`/tasks/${task._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {task.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {task.projectId ? (
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                    {task.projectId.name}
                                </div>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                <status.icon className="h-3 w-3 mr-1.5" />
                                {status.label}
                            </span>
                          </td>
                           <td className="px-6 py-4">
                             <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
                                {priority.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {task.assignedTo ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                        {task.assignedTo.avatar ? (
                                            <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(task.assignedTo.name)
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                          </td>
                          <td className="px-6 py-4">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                        onClick={() => router.push(`/tasks/${task._id}`)}
                                        className="cursor-pointer"
                                   >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {paginatedTasks?.map((task) => {
                         const status = taskStatusConfig[task.status] || taskStatusConfig["todo"];
                         const priority = priorityConfig[task.priority] || priorityConfig["medium"];
                         return (
                             <Card key={task._id} className="hover:shadow-md transition-shadow">
                                 <CardContent className="p-5 space-y-4">
                                     <div className="flex items-start justify-between">
                                         <Link href={`/tasks/${task._id}`} className="flex-1 mr-2">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">{task.title}</h3>
                                         </Link>
                                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priority.bg} ${priority.color}`}>
                                            {priority.label}
                                          </span>
                                     </div>
                                     <div className="flex items-center gap-2 text-xs text-gray-500">
                                         <Briefcase className="h-3.5 w-3.5" />
                                         {task.projectId?.name || "No Project"}
                                     </div>
                                     <div className="flex items-center justify-between pt-2">
                                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                            <status.icon className="h-3 w-3 mr-1.5" />
                                            {status.label}
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(task.dueDate), "MMM d")}
                                            </span>
                                        )}
                                     </div>
                                 </CardContent>
                             </Card>
                         )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTasks?.length || 0)}</span> of{" "}
                    <span className="font-medium">{filteredTasks?.length || 0}</span> tasks
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
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 3 && currentPage > 2) {
                             pageNum = currentPage - 1 + i;
                             if (pageNum > totalPages) pageNum = totalPages - (2 - i);
                        }
                        
                        return (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? "bg-blue-100" : ""}
                        >
                            {pageNum}
                        </Button>
                    )})}
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
