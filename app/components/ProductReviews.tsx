"use client";
import { useState } from "react";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, Lock } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
  isAuthenticated: boolean;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export function ProductReviews({ productId, isAuthenticated, user }: ProductReviewsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="mt-16">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="write-review" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Write Review
            {!isAuthenticated && <Lock className="h-3 w-3 text-muted-foreground" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <ReviewList
            productId={productId}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="write-review" className="mt-6">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
