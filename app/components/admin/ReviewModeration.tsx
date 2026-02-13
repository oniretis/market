"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  User,
  Package,
  Calendar,
  Flag,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
  };
}

export function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "POST",
      });
      
      if (response.ok) {
        fetchReviews(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to approve review:", error);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: "POST",
      });
      
      if (response.ok) {
        fetchReviews(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to reject review:", error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    switch (activeTab) {
      case "pending":
        return !review.isApproved;
      case "approved":
        return review.isApproved;
      default:
        return true;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground">
            Manage and moderate customer reviews
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {reviews.filter(r => !r.isApproved).length} pending approval
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No reviews found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No reviews found in this category.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm font-medium">{review.rating}.0</span>
                          </div>

                          {/* Status Badge */}
                          <Badge variant={review.isApproved ? "default" : "secondary"}>
                            {review.isApproved ? "Approved" : "Pending"}
                          </Badge>

                          {/* Date */}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </div>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <p className="text-gray-700 mb-4">{review.comment}</p>
                        )}

                        {/* Reviewer and Product Info */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {review.user.firstName} {review.user.lastName}
                          </div>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            <span
                              className="hover:text-blue-600 cursor-pointer"
                              onClick={() => window.open(`/product/${review.product.id}`, '_blank')}
                            >
                              {review.product.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/product/${review.product.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Product
                        </Button>
                        
                        {!review.isApproved && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
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
