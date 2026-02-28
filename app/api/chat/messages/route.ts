import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getCurrentUser } from '@/app/lib/admin';
import { z } from 'zod';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

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
    const accessConditions: any[] = [
      { userId: user.id },
      { adminId: user.id },
    ];

    // Add admin access condition for unassigned conversations
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      accessConditions.push({ adminId: null });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        isActive: true,
        OR: accessConditions,
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

    // Emit real-time message via Socket.IO
    try {
      const io = global.io as ServerIO;
      if (io) {
        // Get conversation participants
        const participants = await prisma.chatConversation.findUnique({
          where: { id: conversationId },
          select: { userId: true, adminId: true }
        });

        // Determine who should receive the message (not the sender)
        const recipientId = user.id === participants?.userId ? participants?.adminId : participants?.userId;

        // Create message payload
        const messagePayload = {
          ...message,
          conversationId,
          senderId: user.id,
          recipientId,
        };

        if (recipientId) {
          // Send to specific recipient only (not to the sender)
          io.to(`user:${recipientId}`).emit('new_message', messagePayload);
          console.log('Message sent to specific user:', recipientId, 'Message ID:', message.id);
        } else {
          // If no specific recipient (unassigned conversation), send to conversation room but exclude sender
          // This is a fallback - ideally we should have a recipient
          io.to(`conversation:${conversationId}`).emit('new_message', messagePayload);
          console.log('Message broadcasted to conversation room (no specific recipient):', message.id);
        }
      }
    } catch (socketError) {
      console.error('Socket.IO broadcast error:', socketError);
      // Continue without failing the API response
    }

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Load 50 messages at a time
    const cursor = searchParams.get('cursor'); // For cursor-based pagination

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
    const accessConditions: any[] = [
      { userId: user.id },
      { adminId: user.id },
    ];

    // Add admin access condition for unassigned conversations
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      accessConditions.push({ adminId: null });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        isActive: true,
        OR: accessConditions,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Build where clause for pagination
    const whereClause: any = { conversationId };
    if (cursor) {
      whereClause.createdAt = { lt: new Date(cursor) };
    }

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' }, // Get newest first for pagination
      take: limit,
    });

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    // Get total count for pagination info
    const totalCount = await prisma.message.count({
      where: { conversationId },
    });

    // Mark messages as read for current user (only for messages they received)
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Return paginated response
    const hasMore = messages.length === limit;
    const nextCursor = hasMore && messages.length > 0
      ? messages[messages.length - 1].createdAt
      : null;

    return NextResponse.json({
      messages: chronologicalMessages,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
