'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Wifi, WifiOff, Clock, MessageSquare, UserCheck } from 'lucide-react';
import SortDropdown from './sort-dropdown';
import { Conversation } from './types';
import ConversationCard from './ConversationCard';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  statusFilter: string;
  sortBy: string;
  selectedConversationId: string | null;
  isConnected: boolean;
  onStatusFilterChange: (filter: string) => void;
  onSortByChange: (sortBy: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  getStatusBadge: (conversation: Conversation) => string;
  formatTime: (dateString: string) => string;
}

export default function ConversationList({
  conversations,
  isLoading,
  statusFilter,
  sortBy,
  selectedConversationId,
  isConnected,
  onStatusFilterChange,
  onSortByChange,
  onConversationSelect,
  getStatusBadge,
  formatTime
}: ConversationListProps) {
  const sortOptions = [
    { value: 'recent', label: 'Recent Activity', icon: <Clock className="h-3 w-3" /> },
    { value: 'newest', label: 'Newest Messages', icon: <MessageSquare className="h-3 w-3" /> },
    { value: 'unread', label: 'Unread First', icon: <MessageCircle className="h-3 w-3" /> },
    { value: 'active', label: 'Active Users', icon: <UserCheck className="h-3 w-3" /> },
  ];

  return (
    <div className="w-96 border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          {/* Connection status indicator */}
          <div className="flex items-center space-x-1">
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
        <div className="flex items-center space-x-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange('active')}
          >
            Active
          </Button>
          <SortDropdown
            options={sortOptions}
            value={sortBy}
            onChange={onSortByChange}
          />
        </div>
      </div>
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onSelect={onConversationSelect}
                getStatusBadge={getStatusBadge}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
