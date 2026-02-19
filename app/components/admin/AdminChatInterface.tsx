'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  User,
  Crown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Archive,
  RotateCcw
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  Admin?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  Product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  Message: Message[];
  _count: {
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, [statusFilter]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/chat?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load conversations');
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Network error. Please check your connection.');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load messages:', errorData);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
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

        // Update conversation in list
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, updatedAt: new Date().toISOString(), Message: [message] }
            : conv
        ));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', errorData);
        setError(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationAction = async (conversationId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, action }),
      });

      if (response.ok) {
        const updatedConversation = await response.json();
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? updatedConversation : conv
        ));

        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (conversation: Conversation) => {
    if (!conversation.isActive) {
      return <Badge variant="secondary">Closed</Badge>;
    }
    if (conversation._count.Message > 0) {
      return <Badge variant="destructive">{conversation._count.Message}</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Conversations List */}
      <div className="w-96 border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <div className="flex space-x-2">
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
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md m-2">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-colors ${selectedConversation?.id === conversation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conversation.User.profileImage} />
                        <AvatarFallback>
                          {conversation.User.firstName[0]}{conversation.User.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {conversation.User.firstName} {conversation.User.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{conversation.User.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(conversation)}
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium truncate">{conversation.Product.name}</p>
                  </div>

                  {conversation.Message.length > 0 && (
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.Message[0].content}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.updatedAt)}
                    </span>
                    {conversation.Admin && (
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">
                          {conversation.Admin.firstName}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 border rounded-lg">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.User.profileImage} />
                    <AvatarFallback>
                      {selectedConversation.User.firstName[0]}{selectedConversation.User.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.User.firstName} {selectedConversation.User.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedConversation.User.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Package className="h-4 w-4" />
                    <span>{selectedConversation.Product.name}</span>
                  </div>

                  <div className="flex space-x-1">
                    {selectedConversation.Admin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConversationAction(selectedConversation.id, 'unassign')}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConversationAction(selectedConversation.id, 'assign')}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}

                    {selectedConversation.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConversationAction(selectedConversation.id, 'close')}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConversationAction(selectedConversation.id, 'reopen')}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-[calc(100%-140px)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.Sender.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.Sender.role === 'USER' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={message.Sender.profileImage} />
                            <AvatarFallback className="text-xs">
                              {message.Sender.role === 'ADMIN' || message.Sender.role === 'SUPER_ADMIN' ? (
                                <Crown className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">
                            {message.Sender.role === 'USER'
                              ? `${message.Sender.firstName} ${message.Sender.lastName}`
                              : 'Admin'
                            }
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${message.Sender.role === 'USER'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    disabled={isLoading || isSending}
                    className="flex-1"
                    maxLength={1000}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || isSending || !newMessage.trim()}
                  >
                    {isSending ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
