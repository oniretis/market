"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Package,
  DollarSign,
  User,
  Calendar,
  Trash2,
  Edit,
  AlertTriangle
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
  category: string | { name: string; id: string };
  images: string[];
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
  approvedAt?: string;
  approvedBy?: string;
  phoneNumber?: string;
  location?: string;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    smallDescription: "",
    category: "",
    phoneNumber: "",
    location: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from admin API...');
      const data = await apiRequest<{ products: Product[] }>('/api/admin/products');
      console.log('API response received:', data);
      console.log('Products array:', data.products);
      console.log('Products length:', data.products?.length || 0);

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        console.log(`Successfully set ${data.products.length} products in state`);
      } else {
        console.error('Invalid products data format:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products', 'Error');
      setProducts([]);
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

  const handleDelete = async (productId: string) => {
    try {
      await apiRequest(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts(); // Refresh the list
    } catch (error) {
      // Error is already handled by apiRequest
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      smallDescription: product.smallDescription,
      category: typeof product.category === 'string' ? product.category : product.category?.name || '',
      phoneNumber: product.phoneNumber || "",
      location: product.location || ""
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    try {
      await apiRequest(`/api/admin/products/${selectedProduct.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      toast.success('Product updated successfully');
      setEditDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts(); // Refresh the list
    } catch (error) {
      // Error is already handled by apiRequest
    }
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleImageError = (productId: string, imageIndex: number) => {
    setImageErrors(prev => new Set(prev).add(`${productId}-${imageIndex}`));
  };

  const filteredProducts = products.filter(product => {
    console.log('Filtering product:', product.name, 'Status:', product.status, 'Active tab:', activeTab);
    switch (activeTab) {
      case "pending":
        return product.status === "PENDING";
      case "approved":
        return product.status === "APPROVED";
      case "rejected":
        return product.status === "REJECTED";
      default:
        console.log('Default case - returning true for product:', product.name);
        return true;
    }
  });

  console.log('Filtered products count:', filteredProducts.length);

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
                        {product.images && product.images.length > 0 && !imageErrors.has(`${product.id}-0`) ? (
                          <div className="relative h-24 w-24">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="rounded-lg object-cover"
                              onError={() => handleImageError(product.id, 0)}
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
                                ₦{product.price}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Package className="h-4 w-4 mr-1" />
                                {typeof product.category === 'string' ? product.category : product.category?.name || 'Unknown'}
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
                              asChild
                            >
                              <Link href={`/admin/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedProduct?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProduct && handleDelete(selectedProduct.id)}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (₦)
              </Label>
              <Input
                id="price"
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="properties">Properties</SelectItem>
                  <SelectItem value="gadgets">Gadgets</SelectItem>
                  <SelectItem value="cars">Cars</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editForm.smallDescription}
                onChange={(e) => setEditForm({ ...editForm, smallDescription: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
