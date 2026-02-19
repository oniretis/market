import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { requireAdmin } from '@/app/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {
      isActive: status === 'all' ? undefined : status === 'active',
    };

    const conversations = await prisma.chatConversation.findMany({
      where: whereClause,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        Admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
          },
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
                senderId: { not: admin.id },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.chatConversation.count({
      where: whereClause,
    });

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin get conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const { conversationId, action } = body;

    if (!conversationId || !action) {
      return NextResponse.json({ error: 'Conversation ID and action required' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'assign':
        updateData = { adminId: admin.id };
        break;
      case 'unassign':
        updateData = { adminId: null };
        break;
      case 'close':
        updateData = { isActive: false };
        break;
      case 'reopen':
        updateData = { isActive: true };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const conversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Product: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Admin update conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
