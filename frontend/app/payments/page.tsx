"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Search,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  FileText,
  Trash2,
  Briefcase,
  ListTodo,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
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
import { api } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";

interface Payment {
  _id: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  notes?: string;
  status: string;
  taskId: {
    _id: string;
    title: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  paidTo: {
    _id: string;
    name: string;
    email: string;
  };
  paidBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const paymentModeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  "cash": { label: "Cash", icon: Banknote, color: "text-green-600", bg: "bg-green-50" },
  "bank_transfer": { label: "Bank Transfer", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  "upi": { label: "UPI", icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
  "paypal": { label: "PayPal", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50" },
  "credit_card": { label: "Credit Card", icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
  "cheque": { label: "Cheque", icon: FileText, color: "text-slate-600", bg: "bg-slate-50" },
  "other": { label: "Other", icon: DollarSign, color: "text-gray-600", bg: "bg-gray-50" },
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

interface Task {
  _id: string;
  title: string;
  amount?: number;
  status: string;
  projectId?: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
}

const taskStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  "todo": { label: "To Do", color: "text-slate-600", bg: "bg-slate-100", icon: Circle },
  "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100", icon: Clock },
  "review": { label: "Review", color: "text-purple-600", bg: "bg-purple-100", icon: AlertCircle },
  "done": { label: "Done", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"completed" | "pending">("completed");
  const [modeFilter, setModeFilter] = useState("all");
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  useState(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({ id: parsed.id || parsed._id, role: parsed.role });
    }
  });

  const isAdminOrManager = user?.role === "admin" || user?.role === "manager";
  
  // Fetch all payments
  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get("/payments");
      return res.data;
    },
  });

  // Fetch all tasks for pending calculation
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      // We need all tasks to check for pending amounts. 
      // In a real app with pagination, we might need a dedicated endpoint for "tasks with pending payments"
      const res = await api.get("/tasks"); 
      return res.data;
    },
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => api.delete(`/payments/${paymentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  // Process data for "Pending" tab
  const pendingTasks = tasks?.map(task => {
    const taskPayments = payments?.filter(p => p.taskId?._id === task._id) || [];
    const paidAmount = taskPayments.reduce((sum, p) => sum + p.amount, 0);
    const taskAmount = task.amount || 0;
    const remainingAmount = Math.max(0, taskAmount - paidAmount);
    
    return {
      ...task,
      paidAmount,
      remainingAmount
    };
  }).filter(t => t.remainingAmount > 0) || [];

  // Filter payments (Completed Tab)
  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch = 
      (payment.paidTo?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (payment.paidTo?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (payment.taskId?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (payment.projectId?.name || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesMode = modeFilter === "all" || payment.paymentMode === modeFilter;
    
    return matchesSearch && matchesMode;
  });

  // Filter pending tasks (Pending Tab)
  const filteredPendingTasks = pendingTasks.filter((task) => {
     return (task.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (task.projectId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (task.assignedTo?.name || "").toLowerCase().includes(search.toLowerCase());
  });


  // Calculate totals
  const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingTotal = pendingTasks.reduce((sum, t) => sum + t.remainingAmount, 0);
  
  const thisMonthPayments = payments?.filter(p => {
    if (!p.paymentDate) return false;
    const paymentDate = new Date(p.paymentDate);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
  }) || [];
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const isLoading = isLoadingPayments || isLoadingTasks;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-0.5">
              Track all payments made for tasks and projects
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
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
                  <p className="text-sm text-gray-500">Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${pendingTotal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">This Month Paid</p>
                  <p className="text-2xl font-bold text-gray-900">${thisMonthTotal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{payments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className="border-gray-200">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab("completed")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === "completed"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Completed Payments
                        </button>
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === "pending"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Pending Payments
                        </button>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10 border-gray-200"
                            />
                        </div>
                        {activeTab === "completed" && (
                             <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <Select value={modeFilter} onValueChange={setModeFilter}>
                                <SelectTrigger className="w-[160px] h-10 border-gray-200">
                                    <SelectValue placeholder="Payment Mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200">
                                    <SelectItem value="all" className="cursor-pointer">All Modes</SelectItem>
                                    <SelectItem value="cash" className="cursor-pointer">Cash</SelectItem>
                                    <SelectItem value="bank_transfer" className="cursor-pointer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi" className="cursor-pointer">UPI</SelectItem>
                                    <SelectItem value="paypal" className="cursor-pointer">PayPal</SelectItem>
                                    <SelectItem value="credit_card" className="cursor-pointer">Credit Card</SelectItem>
                                    <SelectItem value="cheque" className="cursor-pointer">Cheque</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : activeTab === "completed" ? (
                // Completed Payments List
               filteredPayments && filteredPayments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {filteredPayments.map((payment) => {
                    const mode = paymentModeConfig[payment.paymentMode] || paymentModeConfig["other"];
                    const ModeIcon = mode.icon;
                    return (
                        <div
                        key={payment._id}
                        className="p-5 hover:bg-gray-50 transition-colors"
                        >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${mode.bg} flex items-center justify-center flex-shrink-0`}>
                                <ModeIcon className={`h-6 w-6 ${mode.color}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900 text-lg">${payment.amount.toLocaleString()}</p>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${mode.bg} ${mode.color}`}>
                                    {mode.label}
                                </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                {/* Paid To */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400">Paid to:</span>
                                    <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-semibold">
                                        {getInitials(payment.paidTo.name || payment.paidTo.email)}
                                    </div>
                                    <span className="font-medium text-gray-700">{payment.paidTo.name}</span>
                                    </div>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{format(new Date(payment.paymentDate), "MMM d, yyyy")}</span>
                                </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
                                {/* Project */}
                                {payment.projectId && (
                                    <Link 
                                    href={`/projects/${payment.projectId._id}`}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>{payment.projectId.name}</span>
                                    </Link>
                                )}
                                
                                {/* Task */}
                                {payment.taskId && (
                                    <Link 
                                    href={`/tasks/${payment.taskId._id}`}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                    <ListTodo className="h-3.5 w-3.5" />
                                    <span>{payment.taskId.title}</span>
                                    </Link>
                                )}
                                </div>
                                
                                {payment.notes && (
                                <p className="text-sm text-gray-400 mt-2 italic">&quot;{payment.notes}&quot;</p>
                                )}
                            </div>
                            </div>
                            
                            {isAdminOrManager && (
                            <button
                                onClick={() => {
                                if (confirm("Delete this payment?")) {
                                    deletePaymentMutation.mutate(payment._id);
                                }
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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
                <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No payments found</p>
                    <p className="text-sm text-gray-400 mt-1">
                    Payments made for tasks will appear here
                    </p>
                </div>
                )
            ) : (
                // Pending Payments List
                filteredPendingTasks && filteredPendingTasks.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredPendingTasks.map((task) => {
                            const status = taskStatusConfig[task.status] || taskStatusConfig["todo"];
                            const StatusIcon = status.icon;

                            return (
                                <div key={task._id} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                 <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900 text-lg">${task.remainingAmount.toLocaleString()}</p>
                                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                                        Pending
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                    {/* Assigned To */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-gray-400">Assigned to:</span>
                                                        {task.assignedTo ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-semibold">
                                                                {getInitials(task.assignedTo.name || task.assignedTo.email)}
                                                                </div>
                                                                <span className="font-medium text-gray-700">{task.assignedTo.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Unassigned</span>
                                                        )}
                                                    </div>
                                                     {/* Due Date */}
                                                    {task.dueDate && (
                                                        <div className="flex items-center gap-1 text-red-500">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
                                                     {/* Project */}
                                                    {task.projectId && (
                                                        <Link 
                                                        href={`/projects/${task.projectId._id}`}
                                                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                                        >
                                                        <Briefcase className="h-3.5 w-3.5" />
                                                        <span>{task.projectId.name}</span>
                                                        </Link>
                                                    )}
                                                    
                                                    {/* Task */}
                                                    <Link 
                                                        href={`/tasks/${task._id}`}
                                                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        <ListTodo className="h-3.5 w-3.5" />
                                                        <span>{task.title}</span>
                                                    </Link>
                                                </div>

                                                <div className="mt-2 flex items-center gap-2 text-xs">
                                                     <span className="text-gray-400">Task Budget: ${task.amount?.toLocaleString()}</span>
                                                     <span className="text-gray-300">•</span>
                                                     <span className="text-emerald-600">Paid: ${task.paidAmount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2">
                                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </span>
                                            <Link href={`/tasks/${task._id}`}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    Pay Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-lg">No pending payments</p>
                        <p className="text-sm text-gray-400 mt-1">
                            All set! No tasks possess undefined pending balances.
                        </p>
                    </div>
                )
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
