"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  phoneNumber?: string;
  location?: string;
  listingType: "EXPRESS" | "MARKET";
  isSold: boolean;
  createdAt: string;
}

interface ProductManagerProps {
  products: Product[];
  onProductSold: (productId: string) => void;
}

export function ProductManager({ products, onProductSold }: ProductManagerProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleMarkAsSold = async (productId: string) => {
    setIsUpdating(productId);
    
    try {
      const response = await fetch(`/api/products/${productId}/mark-sold`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark product as sold');
      }

      toast.success('Product marked as sold successfully!');
      onProductSold(productId);
    } catch (error) {
      toast.error('Failed to mark product as sold');
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>
                  Listed on {new Date(product.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={product.listingType === 'EXPRESS' ? 'default' : 'secondary'}>
                  {product.listingType}
                </Badge>
                {product.isSold && <Badge variant="destructive">Sold</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Price</p>
                <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="capitalize">{product.category}</p>
              </div>
              {product.phoneNumber && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p>{product.phoneNumber}</p>
                </div>
              )}
              {product.location && (
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p>{product.location}</p>
                </div>
              )}
            </div>
            {!product.isSold && (
              <div className="mt-4">
                <Button
                  onClick={() => handleMarkAsSold(product.id)}
                  disabled={isUpdating === product.id}
                  className="w-full"
                >
                  {isUpdating === product.id ? 'Marking as sold...' : 'Mark as Sold'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
