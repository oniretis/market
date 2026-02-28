import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO, Socket } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_SITE_URL
          : ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"]
      }
    });

    // Store active users and their socket IDs
    const activeUsers = new Map<string, string>(); // userId -> socketId
    const adminSockets = new Set<string>(); // admin socketIds

    io.on('connection', (socket: any) => {
      console.log('Client connected:', socket.id);

      // User joins with their user ID and role
      socket.on('join', (data: { userId: string; role: string }) => {
        console.log('User joining:', data);

        // Store user socket mapping
        activeUsers.set(data.userId, socket.id);

        // Track admin sockets
        if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
          adminSockets.add(socket.id);
          console.log('Admin joined:', data.userId);
        }

        socket.userId = data.userId;
        socket.role = data.role;

        // Join user to their personal room for direct messages
        socket.join(`user:${data.userId}`);

        // Notify admins that a user is online
        if (data.role === 'USER') {
          io.to(Array.from(adminSockets)).emit('user_online', {
            userId: data.userId,
            socketId: socket.id
          });
        }
      });

      // Join conversation room
      socket.on('join_conversation', (conversationId: string) => {
        console.log('Joining conversation:', conversationId);
        socket.join(`conversation:${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
      });

      // Handle new message
      socket.on('send_message', (data: any) => {
        console.log('New message:', data);

        // Broadcast to conversation room
        io.to(`conversation:${data.conversationId}`).emit('new_message', data);

        // Also send to specific user if they're not in the room
        if (data.recipientId && activeUsers.has(data.recipientId)) {
          io.to(activeUsers.get(data.recipientId)!).emit('new_message', data);
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          userId: data.userId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          userId: data.userId,
          isTyping: false
        });
      });

      // Handle message read status
      socket.on('mark_read', (data: { conversationId: string; messageId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('message_read', {
          messageId: data.messageId,
          readBy: data.userId
        });
      });

      // Handle conversation status changes
      socket.on('conversation_status', (data: { conversationId: string; status: string; updatedBy: string }) => {
        io.to(`conversation:${data.conversationId}`).emit('conversation_updated', data);
      });

      // Handle admin assignment
      socket.on('admin_assigned', (data: { conversationId: string; adminId: string }) => {
        io.to(`conversation:${data.conversationId}`).emit('admin_assigned', data);

        // Notify specific admin
        if (activeUsers.has(data.adminId)) {
          io.to(activeUsers.get(data.adminId)!).emit('assigned_to_conversation', data);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        if (socket.userId) {
          activeUsers.delete(socket.userId);
          adminSockets.delete(socket.id);

          // Notify admins that user is offline
          if (socket.role === 'USER') {
            io.to(Array.from(adminSockets)).emit('user_offline', {
              userId: socket.userId,
              socketId: socket.id
            });
          }
        }
      });

      // Error handling
      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
    });

    res.socket.server.io = io;

    // Store io instance globally for API access
    global.io = io;
  }
  res.end();
};

export default SocketHandler;
