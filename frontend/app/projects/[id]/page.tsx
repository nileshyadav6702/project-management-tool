"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Flag,
  Building2,
  Mail,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  PauseCircle,
  Plus,
  X,
  ListTodo,
  Trash2,
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
import { format } from "date-fns";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface Team {
  _id: string;
  name: string;
  members?: string[];
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  teamId?: Team;
  teamMembers?: TeamMember[];
  budget?: number;
  deadline?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  dueDate?: string;
  amount?: number;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  "planning": { label: "Planning", color: "text-slate-600", bg: "bg-slate-100", icon: Circle },
  "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100", icon: Clock },
  "on-hold": { label: "On Hold", color: "text-orange-600", bg: "bg-orange-100", icon: PauseCircle },
  "completed": { label: "Completed", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
  "cancelled": { label: "Cancelled", color: "text-red-600", bg: "bg-red-100", icon: AlertCircle },
};

const taskStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  "todo": { label: "To Do", color: "text-slate-600", bg: "bg-slate-100" },
  "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100" },
  "review": { label: "Review", color: "text-purple-600", bg: "bg-purple-100" },
  "done": { label: "Done", color: "text-green-600", bg: "bg-green-100" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  "low": { label: "Low", color: "text-gray-600", bg: "bg-gray-100" },
  "medium": { label: "Medium", color: "text-blue-600", bg: "bg-blue-100" },
  "high": { label: "High", color: "text-red-600", bg: "bg-red-100" },
  "urgent": { label: "Urgent", color: "text-red-700", bg: "bg-red-200" },
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

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  useState(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({ id: parsed.id || parsed._id, role: parsed.role });
    }
  });

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";
  const isMember = user?.role === "member";
  
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    amount: 0,
    assignedTo: "",
    priority: "medium",
    status: "todo",
  });

  // Fetch project
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  // Fetch tasks for this project
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: typeof taskForm & { projectId: string }) => api.post("/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setShowTaskForm(false);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        amount: 0,
        assignedTo: "",
        priority: "medium",
        status: "todo",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: Record<string, unknown> = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: taskForm.status,
      projectId: projectId,
      amount: taskForm.amount,
    };
    
    if (taskForm.dueDate) {
      submitData.dueDate = taskForm.dueDate;
    }
    if (taskForm.assignedTo) {
      submitData.assignedTo = taskForm.assignedTo;
    }
    
    createTaskMutation.mutate(submitData as typeof taskForm & { projectId: string });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600">Loading project details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Project not found</p>
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const status = statusConfig[project.status] || statusConfig["planning"];
  const StatusIcon = status.icon;

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>
              <p className="text-gray-500 mt-0.5">
                Created on {format(new Date(project.createdAt), "MMM d, yyyy")}
                {project.createdBy && ` by ${project.createdBy.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdminOrManager && (
              <Link href={`/projects/${projectId}/edit`}>
                <Button variant="outline" className="h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-50">
                  Edit Project
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">About this Project</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {project.description || "No description provided for this project."}
                </p>
              </CardContent>
            </Card>

            {/* Tasks Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <ListTodo className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Tasks</h3>
                      <p className="text-sm text-gray-500">
                        {tasks?.length || 0} tasks in this project
                      </p>
                    </div>
                  </div>
                  {isAdminOrManager && (
                    <Button
                      onClick={() => setShowTaskForm(!showTaskForm)}
                      className={`h-9 px-4 ${showTaskForm ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {showTaskForm ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Create Task Form */}
                {showTaskForm && (
                  <form onSubmit={handleCreateTask} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Task Name */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="taskTitle" className="text-sm font-medium text-gray-700">
                          Task Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="taskTitle"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          placeholder="Enter task name"
                          required
                          className="h-10 border-gray-200"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="taskDescription" className="text-sm font-medium text-gray-700">
                          Description
                        </Label>
                        <textarea
                          id="taskDescription"
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          placeholder="Describe the task..."
                          rows={2}
                          className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                        />
                      </div>

                      {/* Assign To */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Assign To</Label>
                        <Select
                          value={taskForm.assignedTo}
                          onValueChange={(v) => setTaskForm({ ...taskForm, assignedTo: v })}
                        >
                          <SelectTrigger className="h-10 border-gray-200">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            {project.teamMembers?.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500">No members</div>
                            ) : (
                              project.teamMembers?.map((member) => (
                                <SelectItem key={member._id} value={member._id} className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-[9px] font-semibold">
                                      {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                      ) : (
                                        getInitials(member.name || member.email)
                                      )}
                                    </div>
                                    {member.name || member.email}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Due Date */}
                      <div className="space-y-2">
                        <Label htmlFor="taskDueDate" className="text-sm font-medium text-gray-700">Deadline</Label>
                        <Input
                          id="taskDueDate"
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                          className="h-10 border-gray-200"
                        />
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="taskAmount" className="text-sm font-medium text-gray-700">Amount to Pay</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <Input
                            id="taskAmount"
                            type="number"
                            value={taskForm.amount}
                            onChange={(e) => setTaskForm({ ...taskForm, amount: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            className="h-10 pl-7 border-gray-200"
                          />
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Priority</Label>
                        <Select
                          value={taskForm.priority}
                          onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}
                        >
                          <SelectTrigger className="h-10 border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
                            <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                            <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                            <SelectItem value="urgent" className="cursor-pointer">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end mt-4">
                      <Button
                        type="submit"
                        disabled={createTaskMutation.isPending || !taskForm.title.trim()}
                        className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Tasks List */}
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const taskStatus = taskStatusConfig[task.status] || taskStatusConfig["todo"];
                      const taskPriority = priorityConfig[task.priority] || priorityConfig["medium"];
                      return (
                        <div
                          key={task._id}
                          className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Link href={`/tasks/${task._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {task.title}
                                </Link>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${taskStatus.bg} ${taskStatus.color}`}>
                                  {taskStatus.label}
                                </span>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${taskPriority.bg} ${taskPriority.color}`}>
                                  {taskPriority.label}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-[9px] font-semibold">
                                      {task.assignedTo.avatar ? (
                                        <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                                      ) : (
                                        getInitials(task.assignedTo.name || task.assignedTo.email)
                                      )}
                                    </div>
                                    <span>{task.assignedTo.name || task.assignedTo.email}</span>
                                  </div>
                                )}
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                                  </div>
                                )}
                                {task.amount && task.amount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    ${task.amount.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            {isAdminOrManager && (
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this task?")) {
                                    deleteTaskMutation.mutate(task._id);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListTodo className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tasks yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click &quot;Add Task&quot; to create your first task
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Team Members</h3>
                      <p className="text-sm text-gray-500">
                        {project.teamMembers?.length || 0} members assigned
                      </p>
                    </div>
                  </div>
                </div>

                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.teamMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(member.name || member.email)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {member.name || "Unnamed User"}
                          </p>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.role && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                              <User className="h-3.5 w-3.5" />
                              <span className="capitalize">{member.role}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No team members assigned yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add team members to start collaborating
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Project Details Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Flag className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Project Details</h3>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>

                  {/* Team */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Team</span>
                    {project.teamId ? (
                      <span className="flex items-center gap-2 text-sm text-gray-900">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {project.teamId.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Budget</span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {project.budget ? `$${project.budget.toLocaleString()}` : "Not set"}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">Deadline</span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {project.deadline 
                        ? format(new Date(project.deadline), "MMM d, yyyy")
                        : "No deadline"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {project.teamMembers?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Team Members</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{tasks?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">
                      {tasks?.filter(t => t.status === "done").length || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">
                      {tasks?.filter(t => t.status === "in-progress").length || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-5">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-gray-700">Created</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(project.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <div className="flex-1">
                      <p className="text-gray-700">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(project.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-gray-700">Deadline</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(project.deadline), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
