"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Package,
  DollarSign,
  User,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "../ui/simple-toast";
import { apiRequest } from "../../hooks/use-api";

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "APPROVED":
      return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    case "FLAGGED":
      return <Badge variant="outline" className="bg-red-100 text-red-800">Flagged</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
  smallDescription: string;
  category: string;
  images: string[];
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
  approvedAt?: string;
  approvedBy?: string;
  User: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function ProductApprovalList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiRequest<{ products: Product[] }>('/api/admin/products');
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      await apiRequest(`/api/admin/products/${productId}/approve`, {
        method: "POST",
      });
      toast.success('Product approved successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      // Error is already handled by apiRequest
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await apiRequest(`/api/admin/products/${productId}/reject`, {
        method: "POST",
      });
      toast.success('Product rejected successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      // Error is already handled by apiRequest
    }
  };

  const filteredProducts = products.filter(product => {
    switch (activeTab) {
      case "pending":
        return product.status === "PENDING";
      case "approved":
        return product.status === "APPROVED";
      case "rejected":
        return product.status === "REJECTED";
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading products...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Review and approve product listings
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {products.length} total products
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No products found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No products found in this category.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <div className="relative h-24 w-24">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                              <StatusBadge status={product.status} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {product.smallDescription}
                            </p>

                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4 mr-1" />
                                ${product.price}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Package className="h-4 w-4 mr-1" />
                                {product.category}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/product/${product.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {product.status === "PENDING" && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(product.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(product.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Listed by {product.User.firstName} {product.User.lastName} ({product.User.email})
                          </span>
                        </div>
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
