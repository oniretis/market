'use client';

import { Badge } from '@/components/ui/badge';
import { Conversation } from './types';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  getStatusBadge: (conversation: Conversation) => string;
  formatTime: (dateString: string) => string;
}

export default function ConversationCard({
  conversation,
  isSelected,
  onSelect,
  getStatusBadge,
  formatTime
}: ConversationCardProps) {
  return (
    <div
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        }`}
      onClick={() => onSelect(conversation)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                {conversation.User.firstName[0]}{conversation.User.lastName[0]}
              </div>
              {/* Online indicator */}
              {conversation.User.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">
                {conversation.User.firstName} {conversation.User.lastName}
              </p>
              <p className="text-xs text-gray-500 font-medium">{conversation.User.email}</p>
            </div>
          </div>
          {(() => {
            const status = getStatusBadge(conversation);
            if (status === "Closed") {
              return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Closed</Badge>;
            }
            if (status.includes("unread")) {
              return <Badge variant="destructive" className="bg-red-100 text-red-600">{status}</Badge>;
            }
            return <Badge variant="default" className="bg-green-100 text-green-600">Active</Badge>;
          })()}
        </div>

        <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-5 w-5 text-blue-600 flex-shrink-0">📦</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{conversation.Product.name}</p>
            <p className="text-xs text-gray-500">Product Inquiry</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">
              {formatTime(conversation.updatedAt)}
            </p>
          </div>
        </div>

        {conversation.Message.length > 0 && (
          <p className="text-xs text-gray-500 truncate">
            {conversation.Message[0].content}
          </p>
        )}
      </div>
    </div>
  );
}
