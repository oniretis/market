"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Users,
  Search,
  Ban,
  Shield,
  Crown,
  Mail,
  Calendar,
  Package,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    Product: number;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");

      if (response.status === 401) {
        console.error("Authentication required - redirecting to login");
        window.location.href = "/api/auth/login";
        return;
      }

      if (response.status === 403) {
        console.error("Admin access required");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/change-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to change user role:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case "active":
        return matchesSearch && user.isActive;
      case "inactive":
        return matchesSearch && !user.isActive;
      case "admins":
        return matchesSearch && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
      default:
        return matchesSearch;
    }
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-600"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case "ADMIN":
        return <Badge className="bg-blue-600"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="outline"><Users className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading users...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} total users
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No users found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No users found matching your criteria.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          {user.profileImage ? (
                            <div className="relative h-12 w-12">
                              <Image
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                                fill
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 font-medium">' + (user.firstName?.[0] || 'U') + (user.lastName?.[0] || 'U') + '</span></div>';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            {getRoleBadge(user.role)}
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {user._count.Product} products
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        {/* Role Change */}
                        <div className="flex items-center space-x-1">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                        </div>

                        {/* Toggle Status */}
                        <Button
                          variant={user.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {user.isActive ? "Ban" : "Unban"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
