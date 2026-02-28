'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  User,
  Crown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSocket } from '@/app/hooks/useSocket';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
  conversationId?: string; // Added for socket messages
  Sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
  };
}

interface ChatWidgetProps {
  productId: string;
  productName: string;
  productImage?: string;
  category?: string;
  isAuthenticated: boolean;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export default function ChatWidget({ productId, productName, productImage, category, isAuthenticated, user }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { socket, isConnected, error: socketError, join, joinConversation, leaveConversation, sendMessage: sendSocketMessage, startTyping, stopTyping } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // No need to check auth status - it's passed as prop
  }, []);

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      // Join socket with user info
      join(user.id, 'USER');
      initializeConversation();
    }
  }, [isOpen, isAuthenticated, productId, user]);

  useEffect(() => {
    // Add welcome message when chat opens and there are no messages
    if (isOpen && isAuthenticated && messages.length === 0 && !isLoading && !initError) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Hi! How can I help you with this product?',
        messageType: 'TEXT',
        isRead: true,
        createdAt: new Date().toISOString(),
        senderId: 'system',
        Sender: {
          id: 'system',
          firstName: 'Support',
          lastName: 'Team',
          role: 'ADMIN',
          profileImage: undefined
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, isAuthenticated, messages.length, isLoading, initError]);

  useEffect(() => {
    // Focus input when chat opens and is not minimized
    if (isOpen && !isMinimized && !isLoading && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    }
  }, [isOpen, isMinimized, isLoading, conversation]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: Message) => {
      // Validate message data
      if (!data || !data.id || !data.content) {
        console.error('Invalid message received:', data);
        return;
      }

      // Only add message if it's not from current user and belongs to this conversation
      if (data.senderId !== user?.id && conversation && data.conversationId === conversation.id) {
        setMessages(prev => [...prev, data]);

        // Show notification for incoming admin message
        if (data.Sender && (data.Sender.role === 'ADMIN' || data.Sender.role === 'SUPER_ADMIN')) {
          toast.info('New message from admin', {
            description: data.content.length > 50
              ? `${data.content.substring(0, 50)}...`
              : data.content,
            duration: 4000,
          });
        }
      }
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleConversationUpdated = (data: { conversationId: string; status: string }) => {
      if (conversation && data.conversationId === conversation.id) {
        // Update conversation status if needed
        setConversation(prev => prev ? { ...prev, isActive: data.status === 'open' } : null);
      }
    };

    const handleAdminAssigned = (data: { conversationId: string; adminId: string }) => {
      if (conversation && data.conversationId === conversation.id) {
        // Refresh conversation to get admin info
        initializeConversation();
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('admin_assigned', handleAdminAssigned);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('admin_assigned', handleAdminAssigned);
    };
  }, [socket, conversation, user]);

  // Join conversation room when conversation is set
  useEffect(() => {
    if (conversation && socket && isConnected) {
      joinConversation(conversation.id);
    }
  }, [conversation, socket, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversation && socket) {
        leaveConversation(conversation.id);
      }
    };
  }, [conversation, socket]);

  // Removed checkAuthStatus function - auth is now passed as prop

  const initializeConversation = async () => {
    if (isLoading || isSending) return;

    try {
      setIsLoading(true);
      setInitError(null);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const convResponse = await Promise.race([
        fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        }),
        timeoutPromise
      ]) as Response;

      if (convResponse.ok) {
        const convData = await convResponse.json();
        setConversation(convData);
        await loadMessages(convData.id);
      } else {
        const errorData = await convResponse.json().catch(() => ({}));
        setInitError(errorData.error || 'Failed to start chat. Please try again.');
      }
    } catch (error) {
      setInitError(error instanceof Error ? error.message : 'Connection error. Please check your internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        // Handle both old format (array) and new format (object with messages)
        const messagesArray = Array.isArray(data) ? data : (data.messages || []);

        // Filter out any invalid messages and ensure required fields
        const validMessages = messagesArray.filter((msg: Message) =>
          msg &&
          msg.id &&
          msg.content &&
          msg.senderId &&
          msg.Sender
        );
        setMessages(validMessages);
      } else {
        console.error('Failed to load messages:', response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isSending || isLoading) return;

    if (!conversation) {
      await initializeConversation();
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: trimmedMessage,
          messageType: 'TEXT',
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Show success toast
        toast.success('Message sent successfully!', {
          description: 'Your message has been delivered to the admin.',
          duration: 3000,
        });

        // Socket.IO broadcasting is handled by the API route, so we don't need to call it here
        // This prevents duplicate messages
      } else {
        const errorData = await response.json().catch(() => ({}));
        setInitError(errorData.error || 'Failed to send message. Please try again.');

        // Show error toast
        toast.error('Failed to send message', {
          description: errorData.error || 'Please try again.',
          duration: 5000,
        });
      }
    } catch (error) {
      setInitError('Network error. Please check your connection.');

      // Show error toast
      toast.error('Connection error', {
        description: 'Please check your internet connection and try again.',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Handle typing indicators
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      if (socket && isConnected && conversation && user) {
        startTyping(conversation.id, user.id);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && isConnected && conversation && user) {
        stopTyping(conversation.id, user.id);
      }
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    try {
      if (!dateString) return 'Invalid date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const formatSenderName = (sender: Message['Sender']) => {
    if (!sender) return 'Unknown';
    if (sender.id === 'system') return 'Support Team';
    if (sender.role === 'ADMIN' || sender.role === 'SUPER_ADMIN') {
      return 'Admin';
    }
    const firstName = sender.firstName || '';
    const lastName = sender.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Unknown User';
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end space-y-2">
        {category && (
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            Ask about this {category}
          </div>
        )}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/api/auth/login?post_login_redirect=${encodeURIComponent(window.location.pathname)}`;
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
          type="button"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end space-y-2">
      {!isOpen ? (
        <>
          {category && (
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Ask about this {category}
            </div>
          )}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Chat button clicked, opening modal');
              setIsOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
            type="button"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </>
      ) : (
        <Card className={`w-96 shadow-2xl relative z-[9999] ${isMinimized ? 'h-auto' : 'h-[500px]'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden">
                  {productImage ? (
                    <Image
                      src={productImage}
                      alt={productName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{productName}</CardTitle>
                  <p className="text-xs text-gray-500">Product Chat</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {/* Connection status indicator */}
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex flex-col h-[calc(100%-80px)] p-0">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const senderRole = message.Sender?.role || 'USER';
                    const isUserMessage = senderRole === 'USER';

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isUserMessage ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.Sender?.profileImage} />
                              <AvatarFallback className="text-xs">
                                {senderRole === 'ADMIN' || senderRole === 'SUPER_ADMIN' ? (
                                  <Crown className="h-3 w-3" />
                                ) : (
                                  <User className="h-3 w-3" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">
                              {formatSenderName(message.Sender)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${isUserMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                              }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {otherUserTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] order-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              <Crown className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">Admin</span>
                        </div>
                        <div className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isLoading || isSending
                        ? "Loading..."
                        : conversation
                          ? "Type your message..."
                          : initError
                            ? "Chat unavailable"
                            : "Type a message to start chat..."
                    }
                    disabled={isLoading || isSending || !!initError}
                    className="flex-1"
                    tabIndex={0}
                  />
                  <Button
                    onClick={initError ? initializeConversation : sendMessage}
                    disabled={isLoading || isSending || (!newMessage.trim() && !initError)}
                    size="sm"
                    type="button"
                    variant={initError ? "destructive" : "default"}
                  >
                    {isSending ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : initError ? "Retry" : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                {(isLoading || isSending) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {isSending ? 'Sending message...' : 'Loading conversation...'}
                  </p>
                )}
                {!isLoading && !conversation && !initError && (
                  <p className="text-xs text-gray-500 mt-1">Start a conversation about this product</p>
                )}
                {initError && (
                  <p className="text-xs text-red-500 mt-1">{initError}</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
