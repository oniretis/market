'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export default function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] order-1">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-8 w-8 ring-2 ring-gray-200">
            <AvatarFallback className="text-xs font-semibold">
              <User className="h-3 w-3 text-blue-500" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600">User is typing...</p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-2 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
