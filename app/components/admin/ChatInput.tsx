'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  newMessage: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  isSending: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function ChatInput({ 
  newMessage, 
  onInputChange, 
  onKeyPress, 
  onSendMessage, 
  isSending, 
  isLoading, 
  error 
}: ChatInputProps) {
  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center space-x-2">
        <Input
          value={newMessage}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          placeholder="Type your response..."
          disabled={isLoading || isSending}
          className="flex-1 text-lg"
        />
        <Button
          onClick={onSendMessage}
          disabled={isLoading || isSending || !newMessage.trim()}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 transition-colors"
        >
          {isSending ? (
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
