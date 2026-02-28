'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, Archive, RotateCcw, Package } from 'lucide-react';
import { Conversation } from './types';

interface ChatHeaderProps {
  selectedConversation: Conversation;
  onConversationAction: (conversationId: string, action: string) => void;
}

export default function ChatHeader({ selectedConversation, onConversationAction }: ChatHeaderProps) {
  return (
    <>
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                <AvatarImage src={selectedConversation.User.profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {selectedConversation.User.firstName[0]}{selectedConversation.User.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              {selectedConversation.User.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate">{selectedConversation.User.firstName} {selectedConversation.User.lastName}</h3>
              <p className="text-sm text-gray-600 font-medium truncate">{selectedConversation.User.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 mt-3">
          <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{selectedConversation.Product.name}</p>
            <p className="text-xs text-red-500">Product Inquiry</p>
          </div>
        </div>

        <div className="flex space-x-1 mt-3">
          {selectedConversation.Admin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConversationAction(selectedConversation.id, 'unassign')}
              className="hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
            >
              <UserX className="h-4 w-4 flex-shrink-0" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConversationAction(selectedConversation.id, 'assign')}
              className="hover:bg-green-50 hover:border-green-200 transition-colors flex-shrink-0"
            >
              <UserCheck className="h-4 w-4 flex-shrink-0" />
            </Button>
          )}

          {selectedConversation.isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConversationAction(selectedConversation.id, 'close')}
              className="hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
            >
              <Archive className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConversationAction(selectedConversation.id, 'reopen')}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
