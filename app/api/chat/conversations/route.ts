import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getCurrentUser } from '@/app/lib/admin';
import { z } from 'zod';

const createConversationSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  title: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, title } = createConversationSchema.parse(body);

    // Check if product exists and is approved
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { Category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Product not available for chat' }, { status: 400 });
    }

    // Check if conversation already exists for this user and product
    const existingConversation = await prisma.chatConversation.findFirst({
      where: {
        productId,
        userId: user.id,
        isActive: true,
      },
      include: {
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        Product: {
          select: { name: true },
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        productId,
        userId: user.id,
        title: title || `Chat about ${product.name}`,
      },
      include: {
        Product: {
          select: { name: true },
        },
        Message: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'CONVERSATION_STARTED',
        description: `Started conversation about ${product.name}`,
        metadata: {
          conversationId: conversation.id,
          productId,
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    // Validate productId if provided
    if (productId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(productId)) {
        return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
      }
    }

    let conversations;

    if (productId) {
      // Get specific conversation for a product
      conversations = await prisma.chatConversation.findFirst({
        where: {
          productId,
          userId: user.id,
          isActive: true,
        },
        include: {
          Product: {
            select: { name: true, images: true },
          },
          Message: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              Message: {
                where: {
                  isRead: false,
                  senderId: { not: user.id },
                },
              },
            },
          },
        },
      });
    } else {
      // Get all user conversations
      conversations = await prisma.chatConversation.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        include: {
          Product: {
            select: { name: true, images: true },
          },
          Message: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              Message: {
                where: {
                  isRead: false,
                  senderId: { not: user.id },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
