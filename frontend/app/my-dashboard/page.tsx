"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListTodo,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";

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
  dueDate?: string;
  amount?: number;
  createdAt: string;
}

interface Payment {
  _id: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  taskId: {
    _id: string;
    title: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
}

interface UserInfo {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
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

export default function MemberDashboardPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userId = user?.id || user?._id;

  // Fetch tasks assigned to current user
  const { data: myTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["my-tasks", userId],
    queryFn: async () => {
      const res = await api.get(`/tasks?assignedTo=${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Fetch payments to current user
  const { data: myPayments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["my-payments", userId],
    queryFn: async () => {
      const res = await api.get(`/payments?paidTo=${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      api.put(`/tasks/${taskId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
  });

  // Calculate stats
  const totalTasks = myTasks?.length || 0;
  const completedTasks = myTasks?.filter((t) => t.status === "done").length || 0;
  const inProgressTasks = myTasks?.filter((t) => t.status === "in-progress").length || 0;
  const totalEarnings = myPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const pendingTasks = myTasks?.filter((t) => t.status !== "done") || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-0.5">
            Welcome back, {user?.name}! Here&apos;s your work overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ListTodo className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">My Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
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
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
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
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ListTodo className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pending Tasks</h3>
                  <p className="text-sm text-gray-500">{pendingTasks.length} tasks to complete</p>
                </div>
              </div>

              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : pendingTasks.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {pendingTasks.map((task) => {
                    const status = taskStatusConfig[task.status] || taskStatusConfig["todo"];
                    const priority = priorityConfig[task.priority] || priorityConfig["medium"];
                    return (
                      <div
                        key={task._id}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/tasks/${task._id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {task.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priority.bg} ${priority.color}`}>
                                {priority.label}
                              </span>
                            </div>
                            {task.projectId && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <Briefcase className="h-3 w-3" />
                                {task.projectId.name}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>

                          {/* Quick Status Update */}
                          <div className="flex flex-col gap-1">
                            {task.status !== "done" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ taskId: task._id, status: "done" })}
                                disabled={updateStatusMutation.isPending}
                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Done
                              </Button>
                            )}
                            {task.status === "todo" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ taskId: task._id, status: "in-progress" })}
                                disabled={updateStatusMutation.isPending}
                                className="h-7 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">All caught up!</p>
                  <p className="text-sm text-gray-400 mt-1">No pending tasks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Recent Payments</h3>
                  <p className="text-sm text-gray-500">Your earnings history</p>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : myPayments && myPayments.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {myPayments.slice(0, 10).map((payment) => (
                    <div
                      key={payment._id}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {payment.taskId?.title || "Unknown Task"}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Briefcase className="h-3 w-3" />
                            {payment.projectId?.name || "Unknown Project"}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{format(new Date(payment.paymentDate), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payments yet</p>
                  <p className="text-sm text-gray-400 mt-1">Complete tasks to earn</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All My Tasks */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <ListTodo className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">All My Tasks</h3>
                <p className="text-sm text-gray-500">Complete list of assigned tasks</p>
              </div>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : myTasks && myTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Task</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Project</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Priority</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Due Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myTasks.map((task) => {
                      const status = taskStatusConfig[task.status] || taskStatusConfig["todo"];
                      const priority = priorityConfig[task.priority] || priorityConfig["medium"];
                      return (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="py-3">
                            <Link
                              href={`/tasks/${task._id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {task.title}
                            </Link>
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {task.projectId?.name || "-"}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priority.bg} ${priority.color}`}>
                              {priority.label}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {task.amount ? `$${task.amount.toLocaleString()}` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ListTodo className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
