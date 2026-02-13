import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { logActivity } from "@/app/lib/admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const reviewId = params.id;

    // For now, just return success since Review model isn't in the schema yet
    // In the future, this will update the review isApproved status
    // await prisma.review.update({
    //   where: { id: reviewId },
    //   data: { isApproved: true },
    // });

    // Log the activity
    await logActivity(
      admin.id,
      "REVIEW_APPROVED",
      `Review ${reviewId} was approved`,
      { reviewId }
    );

    return NextResponse.json({ 
      message: "Review approved successfully",
      reviewId 
    });
  } catch (error) {
    console.error("Review approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve review" },
      { status: 500 }
    );
  }
}
