"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  User as UserIcon,
  Briefcase,
  ListTodo,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  ChevronRight,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  teamId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

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

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  deadline?: string;
  budget?: number;
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
  notes?: string;
}

const taskStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  "todo": { label: "To Do", color: "text-slate-600", bg: "bg-slate-100" },
  "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100" },
  "review": { label: "Review", color: "text-purple-600", bg: "bg-purple-100" },
  "done": { label: "Done", color: "text-green-600", bg: "bg-green-100" },
};

const paymentModeConfig: Record<string, { label: string; icon: any }> = {
  bank_transfer: { label: "Bank Transfer", icon: Building2 },
  upi: { label: "UPI", icon: CreditCard },
  cash: { label: "Cash", icon: DollarSign },
  other: { label: "Other", icon: CreditCard },
};

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const memberId = params.id as string;

  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "payments">("tasks");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    taskId: "",
    amount: 0,
    paymentMode: "bank_transfer",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  // Fetch member details
  const { data: member, isLoading: memberLoading } = useQuery<User>({
    queryKey: ["user", memberId],
    queryFn: async () => {
      const res = await api.get(`/users/${memberId}`);
      return res.data;
    },
    enabled: !!memberId,
  });

  // Fetch member tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks", "member", memberId],
    queryFn: async () => {
      const res = await api.get(`/tasks?assignedTo=${memberId}`);
      return res.data;
    },
    enabled: !!memberId,
  });

  // Fetch member projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects", "member", memberId],
    queryFn: async () => {
      const res = await api.get(`/projects?memberId=${memberId}`);
      return res.data;
    },
    enabled: !!memberId,
  });

  // Fetch member payments
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["payments", "member", memberId],
    queryFn: async () => {
      const res = await api.get(`/payments?paidTo=${memberId}`);
      return res.data;
    },
    enabled: !!memberId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => api.post("/payments", { ...data, paidTo: memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "member", memberId] });
      setIsPaymentDialogOpen(false);
      setPaymentForm({
        taskId: "",
        amount: 0,
        paymentMode: "bank_transfer",
        paymentDate: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      });
    },
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPaymentMutation.mutate(paymentForm);
  };

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingTasks = tasks?.filter(t => t.status !== "done").length || 0;

  if (memberLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!member) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Member not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-200"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-lg border-2 border-white shadow-sm">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {member.email}
                <span className="text-gray-300">•</span>
                <span className="capitalize">{member.role}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsPaymentDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Make Payment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Projects</p>
                  <p className="text-xl font-bold text-gray-900">{projects?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ListTodo className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Pending Tasks</p>
                  <p className="text-xl font-bold text-gray-900">{pendingTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Completed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {tasks?.filter(t => t.status === "done").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Paid</p>
                  <p className="text-xl font-bold text-gray-900">${totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "tasks" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tasks
              {activeTab === "tasks" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "projects" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Projects
              {activeTab === "projects" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "payments" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Payments
              {activeTab === "payments" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "tasks" && (
              <Card className="border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Task</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Project</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Due Date</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tasksLoading ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : tasks?.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tasks assigned</td></tr>
                        ) : (
                          tasks?.map((task) => {
                            const status = taskStatusConfig[task.status] || taskStatusConfig.todo;
                            return (
                              <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <Link href={`/tasks/${task._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                    {task.title}
                                  </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {task.projectId?.name || "-"}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                                    {status.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {task.amount ? `$${task.amount.toLocaleString()}` : "-"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "projects" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsLoading ? (
                  <div className="col-span-2 py-12 text-center text-gray-500">Loading...</div>
                ) : projects?.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-gray-500">Not enrolled in any projects</div>
                ) : (
                  projects?.map((project) => (
                    <Card key={project._id} className="border-gray-200 hover:border-blue-200 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/projects/${project._id}`} className="font-bold text-gray-900 hover:text-blue-600 block mb-1">
                              {project.name}
                            </Link>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                              {project.description || "No description provided."}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline"}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {project.budget ? `$${project.budget.toLocaleString()}` : "No budget"}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {project.status.replace("-", " ")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <Card className="border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Date</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Task</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Project</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Mode</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paymentsLoading ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : payments?.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No payments recorded</td></tr>
                        ) : (
                          payments?.map((payment) => {
                            const mode = paymentModeConfig[payment.paymentMode] || paymentModeConfig.other;
                            return (
                              <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {payment.taskId?.title || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {payment.projectId?.name || "-"}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <mode.icon className="h-4 w-4 text-gray-400" />
                                    {mode.label}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                  ${payment.amount.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>
                Record a payment for {member.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePaymentSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskId">Select Task</Label>
                <Select
                  value={paymentForm.taskId}
                  onValueChange={(v) => {
                    const task = tasks?.find(t => t._id === v);
                    setPaymentForm({ 
                      ...paymentForm, 
                      taskId: v,
                      amount: task?.amount || 0
                    });
                  }}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Choose a task" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {tasks?.filter(t => t.status === "done").map((task) => (
                      <SelectItem key={task._id} value={task._id} className="cursor-pointer">
                        {task.title} (${task.amount?.toLocaleString()})
                      </SelectItem>
                    ))}
                    {tasks?.filter(t => t.status !== "done").length! > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                        Incomplete Tasks
                      </div>
                    )}
                    {tasks?.filter(t => t.status !== "done").map((task) => (
                      <SelectItem key={task._id} value={task._id} className="cursor-pointer">
                        {task.title} (${task.amount?.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="border-gray-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Mode</Label>
                  <Select
                    value={paymentForm.paymentMode}
                    onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMode: v })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="bank_transfer" className="cursor-pointer">Bank Transfer</SelectItem>
                      <SelectItem value="upi" className="cursor-pointer">UPI</SelectItem>
                      <SelectItem value="cash" className="cursor-pointer">Cash</SelectItem>
                      <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Reference number, etc."
                  className="border-gray-200"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPaymentMutation.isPending || !paymentForm.taskId || paymentForm.amount <= 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {createPaymentMutation.isPending ? "Processing..." : "Confirm Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
