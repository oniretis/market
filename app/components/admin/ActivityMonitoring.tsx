"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Search, 
  Filter, 
  User, 
  Package,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case "USER_REGISTERED":
      return <Users className="h-4 w-4 text-blue-600" />;
    case "PRODUCT_CREATED":
      return <Package className="h-4 w-4 text-green-600" />;
    case "PRODUCT_APPROVED":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "PRODUCT_REJECTED":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "PRODUCT_SOLD":
      return <Package className="h-4 w-4 text-purple-600" />;
    case "REVIEW_CREATED":
      return <Eye className="h-4 w-4 text-yellow-600" />;
    case "USER_BANNED":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "USER_UNBANNED":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "LOGIN":
      return <User className="h-4 w-4 text-blue-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

const getActivityBadge = (action: string) => {
  switch (action) {
    case "USER_REGISTERED":
      return <Badge variant="secondary">User Registration</Badge>;
    case "PRODUCT_CREATED":
      return <Badge className="bg-green-100 text-green-800">Product Created</Badge>;
    case "PRODUCT_APPROVED":
      return <Badge className="bg-green-100 text-green-800">Product Approved</Badge>;
    case "PRODUCT_REJECTED":
      return <Badge variant="destructive">Product Rejected</Badge>;
    case "PRODUCT_SOLD":
      return <Badge className="bg-purple-100 text-purple-800">Product Sold</Badge>;
    case "REVIEW_CREATED":
      return <Badge className="bg-yellow-100 text-yellow-800">Review Created</Badge>;
    case "USER_BANNED":
      return <Badge variant="destructive">User Banned</Badge>;
    case "USER_UNBANNED":
      return <Badge className="bg-green-100 text-green-800">User Unbanned</Badge>;
    case "LOGIN":
      return <Badge variant="outline">Login</Badge>;
    default:
      return <Badge variant="secondary">Activity</Badge>;
  }
};

export function ActivityMonitoring() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/activity");
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeTab) {
      case "users":
        return activity.action.includes("USER");
      case "products":
        return activity.action.includes("PRODUCT");
      case "reviews":
        return activity.action.includes("REVIEW");
      case "security":
        return ["LOGIN", "USER_BANNED", "USER_UNBANNED"].includes(activity.action);
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading activity...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Monitoring</h1>
          <p className="text-muted-foreground">
            Track recent platform activities and system events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchActivities}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="outline" className="text-sm">
            {activities.length} total activities
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="users">User Activities</TabsTrigger>
          <TabsTrigger value="products">Product Activities</TabsTrigger>
          <TabsTrigger value="reviews">Review Activities</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest platform activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No activities found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No activities found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      {/* Activity Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.action)}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getActivityBadge(activity.action)}
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="font-medium text-gray-900 mb-1">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {activity.user.firstName} {activity.user.lastName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                          {activity.ipAddress && (
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              {activity.ipAddress}
                            </div>
                          )}
                        </div>

                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <strong>Metadata:</strong> {JSON.stringify(activity.metadata, null, 2)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/admin/users/${activity.user.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
