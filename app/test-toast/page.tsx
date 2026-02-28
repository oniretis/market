'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ToastTest() {
  const showSuccessToast = () => {
    toast.success('Message sent successfully!', {
      description: 'Your message has been delivered to the admin.',
      duration: 3000,
    });
  };

  const showErrorToast = () => {
    toast.error('Failed to send message', {
      description: 'Please try again.',
      duration: 5000,
    });
  };

  const showInfoToast = () => {
    toast.info('New message from admin', {
      description: 'This is a test message notification.',
      duration: 4000,
    });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Notification Test</h2>
      
      <div className="space-x-4">
        <Button onClick={showSuccessToast} variant="default">
          Show Success Toast
        </Button>
        
        <Button onClick={showErrorToast} variant="destructive">
          Show Error Toast
        </Button>
        
        <Button onClick={showInfoToast} variant="outline">
          Show Info Toast
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        Click the buttons above to test different toast notifications that will appear in the chat system.
      </p>
    </div>
  );
}
