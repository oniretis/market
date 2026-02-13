"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart,
  Package,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number[];
  topSellingProducts: Array<{
    id: string;
    name: string;
    price: number;
    revenue: number;
    soldCount: number;
  }>;
  categoryRevenue: Array<{
    category: string;
    revenue: number;
    count: number;
  }>;
  monthlyStats: {
    currentMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch("/api/admin/analytics/revenue");
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading analytics...</div>;
  }

  if (!revenueData) {
    return <div className="flex items-center justify-center min-h-screen">Failed to load analytics data</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Financial insights and revenue tracking
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleString()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.monthlyStats.currentMonth.toLocaleString()}</div>
            <p className="text-xs flex items-center">
              {revenueData.monthlyStats.growth >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{revenueData.monthlyStats.growth}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  <span className="text-red-600">{revenueData.monthlyStats.growth}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.monthlyStats.lastMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Previous month revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData.monthlyStats.currentMonth > 0 
                ? Math.round(revenueData.monthlyStats.currentMonth / 10) // Placeholder calculation
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Top Selling Products
              </CardTitle>
              <CardDescription>
                Products generating the most revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.topSellingProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No sales data</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start selling products to see analytics here.
                    </p>
                  </div>
                ) : (
                  revenueData.topSellingProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.soldCount} sold × ${product.price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((product.revenue / revenueData.totalRevenue) * 100)}% of total
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Revenue by Category
              </CardTitle>
              <CardDescription>
                Breakdown of revenue across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.categoryRevenue.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                        {category.category.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold capitalize">{category.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.count} products
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${category.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((category.revenue / revenueData.totalRevenue) * 100)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Monthly revenue performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {revenueData.monthlyRevenue.slice(-6).map((revenue, index) => {
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const currentMonth = new Date().getMonth();
                    const monthIndex = (currentMonth - 5 + index + 12) % 12;
                    
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{monthNames[monthIndex]}</h4>
                          <p className="font-bold">${revenue.toLocaleString()}</p>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((revenue / Math.max(...revenueData.monthlyRevenue)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
