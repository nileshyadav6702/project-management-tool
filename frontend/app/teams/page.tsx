"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  CheckCircle,
  Mail,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-purple-100", text: "text-purple-700" },
  manager: { bg: "bg-blue-100", text: "text-blue-700" },
  member: { bg: "bg-gray-100", text: "text-gray-700" },
  developer: { bg: "bg-green-100", text: "text-green-700" },
};

export default function TeamsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users", search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("isActive", statusFilter === "active" ? "true" : "false");
      const res = await api.get(`/users?${params}`);
      return res.data;
    },
  });

  const totalMembers = users?.length || 0;
  const activeMembers = users?.filter(u => u.isActive).length || 0;
  const pendingInvites = users?.filter(u => !u.isActive).length || 0;

  const itemsPerPage = 5;
  const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);
  const paginatedUsers = users?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-500 mt-1">
              Manage your team members, roles, and permissions.
            </p>
          </div>
          <Link href="/invite?open=true" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Members</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">+2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending Invites</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingInvites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card className="border-gray-200 overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full lg:w-40 border-gray-200 rounded-xl bg-gray-50">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-40 border-gray-200 rounded-xl bg-gray-50">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Member
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Date Added
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedUsers?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers?.map((user) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/teams/member/${user._id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-sm">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                user.name?.charAt(0) || "U"
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                              roleColors[user.role]?.bg || "bg-gray-100"
                            } ${roleColors[user.role]?.text || "text-gray-700"}`}
                          >
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                user.isActive ? "bg-green-500" : "bg-yellow-500"
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-600">
                              {user.isActive ? "Active" : "Pending"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                              <DropdownMenuItem
                                onClick={() => router.push(`/teams/member/${user._id}`)}
                                className="cursor-pointer rounded-lg p-2 font-medium"
                              >
                                <Eye className="h-4 w-4 mr-2 text-gray-400" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this member?")) {
                                    alert("Delete functionality to be implemented");
                                  }
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg p-2 font-medium"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">1</span> to{" "}
                <span className="font-bold text-gray-900">{Math.min(itemsPerPage, users?.length || 0)}</span> of{" "}
                <span className="font-bold text-gray-900">{users?.length || 0}</span> results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl font-bold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-xl font-bold"
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
