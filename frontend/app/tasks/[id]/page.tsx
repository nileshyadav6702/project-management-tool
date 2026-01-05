"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Flag,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  CreditCard,
  Banknote,
  Building2,
  FileText,
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
  projectId?: {
    _id: string;
    name: string;
  };
  dueDate?: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  _id: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  notes?: string;
  paidTo: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  paidBy: {
    _id: string;
    name: string;
  };
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

const paymentModeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  "cash": { label: "Cash", icon: Banknote },
  "bank_transfer": { label: "Bank Transfer", icon: Building2 },
  "upi": { label: "UPI", icon: CreditCard },
  "paypal": { label: "PayPal", icon: CreditCard },
  "credit_card": { label: "Credit Card", icon: CreditCard },
  "cheque": { label: "Cheque", icon: FileText },
  "other": { label: "Other", icon: DollarSign },
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

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const queryClient = useQueryClient();
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMode: "bank_transfer",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
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
  const isMember = user?.role === "member";
  // Fetch task
  const { data: task, isLoading, error } = useQuery<Task>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}`);
      return res.data;
    },
    enabled: !!taskId,
  });

  const isAssignee = task?.assignedTo?._id === user?.id;

  // Fetch payments for this task
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["payments", taskId],
    queryFn: async () => {
      const res = await api.get(`/payments?taskId=${taskId}`);
      return res.data;
    },
    enabled: !!taskId,
  });

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => api.put(`/tasks/${taskId}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: typeof paymentForm & { taskId: string; paidTo: string }) => 
      api.post("/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", taskId] });
      setShowPaymentForm(false);
      setPaymentForm({
        amount: 0,
        paymentMode: "bank_transfer",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    },
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => api.delete(`/payments/${paymentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", taskId] });
    },
  });

  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  // Use task.amount if available, otherwise 0. Or perhaps allow indefinite payments if 0? 
  // User asked for "remaining amount", implying there is a budget.
  const taskAmount = task?.amount || 0;
  const remainingAmount = Math.max(0, taskAmount - totalPaid);

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.assignedTo?._id) return;
    
    // Validation
    if (paymentForm.amount <= 0) return;
    if (paymentForm.amount > remainingAmount) {
        alert(`Amount exceeds the remaining budget of $${remainingAmount.toLocaleString()}`);
        return;
    }

    createPaymentMutation.mutate({
      ...paymentForm,
      taskId,
      paidTo: task.assignedTo._id,
    });
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
            <span className="text-gray-600">Loading task details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !task) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Task not found</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  const status = taskStatusConfig[task.status] || taskStatusConfig["todo"];
  const priority = priorityConfig[task.priority] || priorityConfig["medium"];
  const StatusIcon = status.icon;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
              {task.projectId && (
                <p className="text-gray-500 mt-0.5">
                  Project: <Link href={`/projects/${task.projectId._id}`} className="text-blue-600 hover:underline">{task.projectId.name}</Link>
                </p>
              )}
            </div>
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
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Task Description</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {task.description || "No description provided for this task."}
                </p>
              </CardContent>
            </Card>

            {/* Status Update Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Update Status</h3>
                    <p className="text-sm text-gray-500">Change task progress</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(taskStatusConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = task.status === key;
                    // Extract color classes
                    const borderColor = isActive ? config.color.replace('text-', 'border-') : 'border-gray-200';
                    const hoverBg = isActive ? '' : config.bg;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => updateStatusMutation.mutate(key)}
                        disabled={updateStatusMutation.isPending || (isMember && !isAssignee)}
                        className={`
                          relative group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                          ${isActive ? `${config.bg} ${borderColor} shadow-sm scale-[1.02]` : `hover:border-gray-300 hover:bg-gray-50`}
                          ${isMember && !isAssignee ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                         {isActive && (
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                          )}
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
                          ${isActive ? 'bg-white' : `${config.bg} group-hover:bg-white`}
                        `}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <p className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                          {config.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payments Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Payments</h3>
                      <p className="text-sm text-gray-500">
                        {payments?.length || 0} payments • Total: ${totalPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isAdminOrManager && task.assignedTo && (
                    <Button
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                      className={`h-9 px-4 ${showPaymentForm ? 'bg-gray-600 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                    >
                      {showPaymentForm ? "Cancel" : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Payment Form */}
                {showPaymentForm && task.assignedTo && (
                  <form onSubmit={handleCreatePayment} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="paymentAmount" className="text-sm font-medium text-gray-700">
                          Amount <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <Input
                            id="paymentAmount"
                            type="number"
                            max={remainingAmount}
                            value={paymentForm.amount}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val > remainingAmount) {
                                  // Optional: trigger a toast or simply visually warn (for simplicity here just update state, validation is on submit too)
                                }
                                setPaymentForm({ ...paymentForm, amount: val })
                            }}
                            placeholder={`Max: ${remainingAmount}`}
                            required
                            className={`h-10 pl-7 ${paymentForm.amount > remainingAmount ? "border-red-500 focus:ring-red-200" : "border-gray-200"}`}
                          />
                        </div>
                        {paymentForm.amount > remainingAmount && (
                            <p className="text-xs text-red-500 font-medium">
                                Amount cannot exceed remaining budget (${remainingAmount})
                            </p>
                        )}
                         <p className="text-xs text-emerald-600 font-medium">
                            Remaining Budget: ${remainingAmount.toLocaleString()}
                         </p>
                      </div>

                      {/* Payment Mode */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Payment Mode</Label>
                        <Select
                          value={paymentForm.paymentMode}
                          onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMode: v })}
                        >
                          <SelectTrigger className="h-10 border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="cash" className="cursor-pointer">Cash</SelectItem>
                            <SelectItem value="bank_transfer" className="cursor-pointer">Bank Transfer</SelectItem>
                            <SelectItem value="upi" className="cursor-pointer">UPI</SelectItem>
                            <SelectItem value="paypal" className="cursor-pointer">PayPal</SelectItem>
                            <SelectItem value="credit_card" className="cursor-pointer">Credit Card</SelectItem>
                            <SelectItem value="cheque" className="cursor-pointer">Cheque</SelectItem>
                            <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Date */}
                      <div className="space-y-2">
                        <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">Payment Date</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                          className="h-10 border-gray-200"
                        />
                        <Input
                          id="paymentNotes"
                          value={paymentForm.notes}
                          onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          placeholder="Optional notes..."
                          className="h-10 border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        type="submit"
                        disabled={createPaymentMutation.isPending || paymentForm.amount <= 0 || paymentForm.amount > remainingAmount}
                        className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createPaymentMutation.isPending ? "Creating..." : "Create Payment"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Payments List */}
                {payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => {
                      const mode = paymentModeConfig[payment.paymentMode] || paymentModeConfig["other"];
                      const ModeIcon = mode.icon;
                      return (
                        <div
                          key={payment._id}
                          className="p-4 rounded-xl bg-white border border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <ModeIcon className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                  <span>{mode.label}</span>
                                  <span>•</span>
                                  <span>{format(new Date(payment.paymentDate), "MMM d, yyyy")}</span>
                                </div>
                                {payment.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <span>Paid to:</span>
                                  <div className="w-5 h-5 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-[9px] font-semibold">
                                    {payment.paidTo.avatar ? (
                                      <img src={payment.paidTo.avatar} alt={payment.paidTo.name} className="w-full h-full object-cover" />
                                    ) : (
                                      getInitials(payment.paidTo.name || payment.paidTo.email)
                                    )}
                                  </div>
                                  <span className="font-medium">{payment.paidTo.name}</span>
                                </div>
                              </div>
                              {isAdminOrManager && (
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this payment?")) {
                                      deletePaymentMutation.mutate(payment._id);
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No payments yet</p>
                    {task.assignedTo ? (
                      <p className="text-sm text-gray-400 mt-1">
                        Click &quot;Add Payment&quot; to record a payment
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">
                        Assign someone to this task first
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Task Details Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Flag className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Task Details</h3>
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

                  {/* Priority */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Priority</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>

                  {/* Assigned To */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Assigned To</span>
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold">
                          {task.assignedTo.avatar ? (
                            <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(task.assignedTo.name || task.assignedTo.email)
                          )}
                        </div>
                        <span className="text-sm text-gray-900">{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </div>

                  {/* Task Amount */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Task Amount</span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {task.amount ? `$${task.amount.toLocaleString()}` : "Not set"}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">Due Date</span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {task.dueDate 
                        ? format(new Date(task.dueDate), "MMM d, yyyy")
                        : "No due date"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Payment Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalPaid.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total Paid</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">
                      {payments?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Payments</p>
                  </div>
                  {task.amount && task.amount > 0 && (
                    <>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-emerald-600">
                          ${task.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Task Budget</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className={`text-2xl font-bold ${task.amount - totalPaid >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ${Math.abs(task.amount - totalPaid).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {task.amount - totalPaid >= 0 ? 'Remaining' : 'Over Budget'}
                        </p>
                      </div>
                    </>
                  )}
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
                        {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <div className="flex-1">
                      <p className="text-gray-700">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-gray-700">Due Date</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
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
