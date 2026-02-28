'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from './types';
import { Crown, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  formatMessageTime: (dateString: string) => string;
}

export default function MessageBubble({ message, formatMessageTime }: MessageBubbleProps) {
  const isAdmin = message.Sender.role === 'ADMIN' || message.Sender.role === 'SUPER_ADMIN';

  return (
    <div className={`flex ${message.Sender.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${message.Sender.role === 'USER' ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-8 w-8 ring-2 ring-gray-200">
            <AvatarImage src={message.Sender.profileImage} />
            <AvatarFallback className="text-xs font-semibold">
              {isAdmin ? (
                <Crown className="h-3 w-3 text-yellow-500" />
              ) : (
                <User className="h-3 w-3 text-blue-500" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600">
              {message.Sender.firstName} {message.Sender.lastName}
            </p>
            <p className="text-xs text-gray-400">
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
        </div>
        <div className={`rounded-2xl px-4 py-2 shadow-sm ${
          message.Sender.role === 'USER' 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
