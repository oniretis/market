import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.reconnectionAttempts || 5;

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
      autoConnect: options.autoConnect !== false,
      reconnection: options.reconnection !== false,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: options.reconnectionDelay || 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, reconnect manually
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError(error.message);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setError(error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const join = (userId: string, role: string) => {
    if (socket && isConnected) {
      socket.emit('join', { userId, role });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (data: {
    conversationId: string;
    recipientId?: string;
    message: any;
  }) => {
    if (socket && isConnected) {
      socket.emit('send_message', data);
    }
  };

  const startTyping = (conversationId: string, userId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId, userId });
    }
  };

  const stopTyping = (conversationId: string, userId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId, userId });
    }
  };

  const markAsRead = (conversationId: string, messageId: string, userId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_read', { conversationId, messageId, userId });
    }
  };

  const updateConversationStatus = (conversationId: string, status: string, updatedBy: string) => {
    if (socket && isConnected) {
      socket.emit('conversation_status', { conversationId, status, updatedBy });
    }
  };

  const assignAdmin = (conversationId: string, adminId: string) => {
    if (socket && isConnected) {
      socket.emit('admin_assigned', { conversationId, adminId });
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  const reconnect = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  return {
    socket,
    isConnected,
    error,
    join,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    updateConversationStatus,
    assignAdmin,
    disconnect,
    reconnect,
  };
};
