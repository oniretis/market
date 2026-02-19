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
  Crown
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen && isAuthenticated) {
      initializeConversation();
    }
  }, [isOpen, isAuthenticated, productId]);

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
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        setInitError(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setInitError('Network error. Please check your connection.');
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSenderName = (sender: Message['Sender']) => {
    if (sender.role === 'ADMIN' || sender.role === 'SUPER_ADMIN') {
      return 'Admin';
    }
    return `${sender.firstName} ${sender.lastName}`;
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
        <Card className="w-96 h-[500px] shadow-2xl relative z-[9999]">
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
                            {formatSenderName(message.Sender)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${message.Sender.role === 'USER'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
