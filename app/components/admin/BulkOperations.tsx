"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  CheckCircle,
  XCircle,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckSquare,
  Square,
  RefreshCw
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  isSold: boolean;
  createdAt: string;
  User: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function BulkOperations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("approve");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) return;

    setOperationLoading(true);
    try {
      const response = await fetch("/api/admin/bulk/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (response.ok) {
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to bulk approve:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedProducts.length === 0) return;

    setOperationLoading(true);
    try {
      const response = await fetch("/api/admin/bulk/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (response.ok) {
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to bulk reject:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return;
    }

    setOperationLoading(true);
    try {
      const response = await fetch("/api/admin/bulk/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (response.ok) {
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/admin/bulk/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading products...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Operations</h1>
          <p className="text-muted-foreground">
            Perform mass operations on products
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Badge variant="outline" className="text-sm">
            {selectedProducts.length} selected
          </Badge>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={operationLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={operationLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={operationLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="approve">Bulk Approve</TabsTrigger>
          <TabsTrigger value="reject">Bulk Reject</TabsTrigger>
          <TabsTrigger value="delete">Bulk Delete</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Selection
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">Select All</span>
                </div>
              </CardTitle>
              <CardDescription>
                Select products to perform bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No products found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No products available for bulk operations.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        />
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${product.price} • {product.category} • {product.User.firstName} {product.User.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={product.isSold ? "default" : "secondary"}>
                          {product.isSold ? "Sold" : "Available"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/product/${product.id}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Products
                </CardTitle>
                <CardDescription>
                  Download product data as CSV file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export all products to a CSV file for backup or analysis.
                </p>
                <Button onClick={handleExportCSV} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Products
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Import Products
                </CardTitle>
                <CardDescription>
                  Upload products from CSV file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import products from a CSV file. Template will be available soon.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Products (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
