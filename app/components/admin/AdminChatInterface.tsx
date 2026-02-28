'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageCircle,
  Send,
  Crown,
  User,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Clock,
  MessageSquare,
  UserCheck,
  X,
  UserX,
  UserCheck as UserCheckIcon,
  Archive,
  RotateCcw,
  Package
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

interface Conversation {
  id: string;
  title: string;
  productId: string;
  userId: string;
  adminId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  Product: {
    name: string;
    images: string[];
  };
  User: {
    firstName: string;
    lastName: string;
  };
  Admin?: {
    firstName: string;
    lastName: string;
  };
  _count?: {
    Message: number;
  };
}

export default function AdminChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'newest' | 'unread' | 'active'>('recent');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { socket, isConnected, join, joinConversation, leaveConversation, sendMessage: sendSocketMessage, startTyping, stopTyping } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };

    getCurrentUser();
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentUser && socket) {
      join(currentUser.id, 'ADMIN');
    }
  }, [currentUser, socket, join]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy: sortBy
      });

      const response = await fetch(`/api/admin/chat?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      setError('Network error');
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
    if (!trimmedMessage || isSending || !selectedConversation) return;

    try {
      setIsSending(true);
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: trimmedMessage,
          messageType: 'TEXT',
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Socket.IO broadcasting is handled by the API route, so we don't need to call it here
        // This prevents duplicate messages
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Network error');
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
    if (!otherUserTyping && e.target.value.trim()) {
      if (socket && isConnected && selectedConversation && currentUser) {
        startTyping(selectedConversation.id, currentUser.id);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isConnected && selectedConversation && currentUser) {
        stopTyping(selectedConversation.id, currentUser.id);
      }
    }, 1000);
  };

  const formatMessageTime = (dateString: string) => {
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

  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (data: Message) => {
      // Validate message data
      if (!data || !data.id || !data.content) {
        console.error('Invalid message received:', data);
        return;
      }

      // Only add message if it's not from current user and belongs to the selected conversation
      if (data.senderId !== currentUser.id && selectedConversation && data.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, data]);
      }

      // Show notification for incoming user messages
      if (data.Sender && data.Sender.role === 'USER' && data.senderId !== currentUser.id) {
        const conversation = conversations.find(conv => conv.id === data.conversationId);
        if (conversation) {
          toast.info('New message from user', {
            description: `${conversation.User.firstName}: ${data.content.length > 50 ? `${data.content.substring(0, 50)}...` : data.content}`,
            duration: 4000,
          });
        }
      }
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean; conversationId?: string }) => {
      if (data.userId !== currentUser?.id && selectedConversation && (!data.conversationId || data.conversationId === selectedConversation.id)) {
        setOtherUserTyping(data.isTyping);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, currentUser, selectedConversation, conversations]);

  // Join conversation room when conversation is selected
  useEffect(() => {
    if (selectedConversation && socket && isConnected) {
      joinConversation(selectedConversation.id);
    }

    // Cleanup when conversation changes or component unmounts
    return () => {
      if (selectedConversation && socket) {
        leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, socket, isConnected, joinConversation, leaveConversation]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      setError(null);
    }
  }, [selectedConversation]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [selectedConversation]);

  // Reload conversations when filters change
  useEffect(() => {
    loadConversations();
  }, [statusFilter, sortBy]);

  // Group conversations by user for WhatsApp-style UI
  const conversationsByUser = conversations.reduce((acc, conversation) => {
    const userId = conversation.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: conversation.User,
        conversations: [],
        lastMessage: conversation.updatedAt,
        unreadCount: 0,
        latestConversation: conversation
      };
    }
    acc[userId].conversations.push(conversation);
    acc[userId].unreadCount += conversation._count?.Message || 0;

    // Update latest conversation if this one is more recent
    if (new Date(conversation.updatedAt) > new Date(acc[userId].lastMessage)) {
      acc[userId].lastMessage = conversation.updatedAt;
      acc[userId].latestConversation = conversation;
    }

    return acc;
  }, {} as Record<string, {
    user: Conversation['User'];
    conversations: Conversation[];
    lastMessage: string;
    unreadCount: number;
    latestConversation: Conversation;
  }>);

  // Convert to array and sort by last message time
  const userConversations = Object.values(conversationsByUser).sort((a, b) =>
    new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime()
  );

  // Filter user conversations based on search
  const filteredUserConversations = userConversations.filter(userConv => {
    const matchesSearch = userConv.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userConv.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userConv.conversations.some(conv =>
        conv.Product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (statusFilter === 'active') {
      return matchesSearch && userConv.conversations.some(conv => conv.isActive);
    }
    return matchesSearch;
  });

  return (
    <div className="flex h-full bg-gray-50">
      {/* Conversations List */}
      <div className="w-96 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            {/* Connection status indicator */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border rounded px-2 py-1 ml-auto"
              >
                <option value="recent">Recent Activity</option>
                <option value="newest">Newest Messages</option>
                <option value="unread">Unread First</option>
                <option value="active">Active Users</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversations List - WhatsApp Style */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredUserConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUserConversations.map((userConv) => {
                const isSelected = selectedConversation &&
                  userConv.conversations.some(conv => conv.id === selectedConversation.id);
                const latestConv = userConv.latestConversation;

                return (
                  <div
                    key={userConv.user.id}
                    onClick={() => setSelectedConversation(latestConv)}
                    className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* User Avatar */}
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userConv.user.profileImage} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-semibold">
                            {userConv.user.firstName[0]}{userConv.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator for active users */}
                        {userConv.conversations.some(conv => conv.isActive) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {userConv.user.firstName} {userConv.user.lastName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(userConv.lastMessage)}
                          </span>
                        </div>

                        {/* Product tags */}
                        <div className="flex items-center space-x-1 mb-1">
                          {userConv.conversations.slice(0, 2).map((conv, index) => (
                            <Badge key={conv.id} variant="outline" className="text-xs px-1 py-0">
                              {conv.Product.name.length > 15
                                ? `${conv.Product.name.substring(0, 15)}...`
                                : conv.Product.name}
                            </Badge>
                          ))}
                          {userConv.conversations.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{userConv.conversations.length - 2} more
                            </span>
                          )}
                        </div>

                        {/* Last message preview and unread count */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {userConv.conversations.length === 1
                              ? 'Product inquiry'
                              : `${userConv.conversations.length} product inquiries`}
                          </p>
                          {userConv.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-2 py-0 min-w-[20px] text-center">
                              {userConv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-500">
                    <AvatarImage src={selectedConversation.User.profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                      {selectedConversation.User.firstName[0]}{selectedConversation.User.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedConversation.User.firstName} {selectedConversation.User.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600">
                        {selectedConversation.Product.name}
                      </p>
                      {/* Show if user has multiple conversations */}
                      {conversationsByUser[selectedConversation.userId]?.conversations.length > 1 && (
                        <select
                          value={selectedConversation.id}
                          onChange={(e) => {
                            const newConv = conversationsByUser[selectedConversation.userId].conversations.find(
                              conv => conv.id === e.target.value
                            );
                            if (newConv) setSelectedConversation(newConv);
                          }}
                          className="text-xs border rounded px-2 py-1"
                        >
                          {conversationsByUser[selectedConversation.userId].conversations.map((conv) => (
                            <option key={conv.id} value={conv.id}>
                              {conv.Product.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedConversation.Admin ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Unassign conversation:', selectedConversation.id);
                      }}
                      className="hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Assign conversation:', selectedConversation.id);
                      }}
                      className="hover:bg-green-50 hover:border-green-200 transition-colors"
                    >
                      <UserCheckIcon className="h-4 w-4" />
                    </Button>
                  )}

                  {selectedConversation.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Close conversation:', selectedConversation.id);
                      }}
                      className="hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Reopen conversation:', selectedConversation.id);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedConversation.Product.name}
                  </p>
                  <p className="text-xs text-blue-600">Product Inquiry</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto">
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
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                              <AvatarImage src={message.Sender?.profileImage} />
                              <AvatarFallback className="text-xs">
                                {senderRole === 'ADMIN' || senderRole === 'SUPER_ADMIN' ? (
                                  <Crown className="h-3 w-3 text-yellow-500" />
                                ) : (
                                  <User className="h-3 w-3 text-blue-500" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-600">
                                {message.Sender?.firstName || ''} {message.Sender?.lastName || ''}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${isUserMessage
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
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
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                            <AvatarFallback className="text-xs">
                              <User className="h-3 w-3 text-blue-500" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600">
                              {selectedConversation?.User?.firstName || 'User'}
                            </p>
                            <p className="text-xs text-gray-400">typing...</p>
                          </div>
                        </div>
                        <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-2 shadow-sm">
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

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    disabled={isLoading || isSending}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || isSending || !newMessage.trim()}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSending ? (
                      <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
                <MessageCircle className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Admin Chat</h2>
                <p className="text-gray-600 mb-6">Select a conversation to start responding to customer inquiries</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Real-time Messaging</p>
                      <p className="text-xs text-gray-600">Instant communication with customers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Product Support</p>
                      <p className="text-xs text-gray-600">Help with product inquiries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}