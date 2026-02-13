import { NextRequest, NextResponse } from "next/server";
import { MarkProductAsSold } from "@/app/actions";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    const updatedProduct = await MarkProductAsSold(productId);
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error marking product as sold:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
