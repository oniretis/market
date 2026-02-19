import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getCurrentUser } from '@/app/lib/admin';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long').trim(),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content, messageType } = sendMessageSchema.parse(body);

    // Check if conversation exists and user has access
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        isActive: true,
        OR: [
          { userId: user.id },
          { adminId: user.id },
          { adminId: null, User: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
        ],
      },
      include: {
        Product: { select: { name: true } },
        User: { select: { firstName: true, lastName: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // If admin is joining for the first time, assign them
    if (!conversation.adminId && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { adminId: user.id },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content,
        messageType,
      },
      include: {
        Sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Mark messages as read for admin if user is sending
    if (user.role === 'USER') {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'MESSAGE_SENT',
        description: `Sent message in conversation about ${conversation.Product?.name || 'product'}`,
        metadata: {
          messageId: message.id,
          conversationId,
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Send message error:', error);
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
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Validate UUID format
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(conversationId)) {
        return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 });
    }

    // Check if user has access to conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        isActive: true,
        OR: [
          { userId: user.id },
          { adminId: user.id },
          { adminId: null, User: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        Sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read for current user
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
