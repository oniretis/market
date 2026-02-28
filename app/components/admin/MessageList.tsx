'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from './types';
import { forwardRef, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  otherUserTyping: boolean;
  formatMessageTime: (dateString: string) => string;
}

export default function MessageList({ messages, otherUserTyping, formatMessageTime }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-[calc(100%-140px)]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              formatMessageTime={formatMessageTime}
            />
          ))}
          {otherUserTyping && <TypingIndicator isVisible={true} />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
