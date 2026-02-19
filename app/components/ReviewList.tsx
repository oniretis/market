"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, Calendar } from "lucide-react";
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
  };
}

interface ReviewListProps {
  productId: string;
  refreshTrigger?: number;
}

export function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger, fetchReviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div>Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(Math.round(Number(calculateAverageRating())))}
              </div>
              <span className="text-lg font-semibold">
                {calculateAverageRating()}
              </span>
              <Badge variant="outline">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Star className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No reviews yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to review this product!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-medium">
                        {review.rating}.0
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge variant="default">Verified Purchase</Badge>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                )}

                {/* Reviewer */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  {review.user.firstName} {review.user.lastName}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
