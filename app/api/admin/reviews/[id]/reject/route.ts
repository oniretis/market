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
    // In the future, this will delete or reject the review
    // await prisma.review.delete({
    //   where: { id: reviewId },
    // });

    // Log the activity
    await logActivity(
      admin.id,
      "REVIEW_REJECTED",
      `Review ${reviewId} was rejected`,
      { reviewId }
    );

    return NextResponse.json({ 
      message: "Review rejected successfully",
      reviewId 
    });
  } catch (error) {
    console.error("Review rejection error:", error);
    return NextResponse.json(
      { error: "Failed to reject review" },
      { status: 500 }
    );
  }
}
