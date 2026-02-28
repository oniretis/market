'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAdminChat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Utility functions
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const formatTime = useCallback((dateString: string) => {
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
  }, []);

  const formatMessageTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getStatusBadge = useCallback((conversation: any) => {
    if (!conversation.isActive) {
      return "Closed";
    }
    if (conversation._count?.Message > 0) {
      return `${conversation._count.Message} unread`;
    }
    return "Active";
  }, []);

  // Data loading functions
  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/chat?status=${statusFilter}&sortBy=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        setError('Failed to load conversations');
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Network error. Please check your connection.');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, sortBy]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  }, []);

  const selectConversation = useCallback(async (conversation: any) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  // Message handling
  const sendMessage = useCallback(async () => {
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
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, selectedConversation]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Socket event handlers
  useEffect(() => {
    // Socket logic would go here when socket is available
    return () => {
      // Cleanup would go here
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial load
  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    newMessage,
    isLoading,
    isSending,
    statusFilter,
    sortBy,
    error,
    isTyping,
    otherUserTyping,
    currentUser,
    isConnected,
    messagesEndRef,

    // Actions
    setStatusFilter,
    setSortBy,
    selectConversation,
    sendMessage,
    handleInputChange,
    handleKeyPress,

    // Utilities
    formatTime,
    formatMessageTime,
    getStatusBadge,
    scrollToBottom,
  };
}
