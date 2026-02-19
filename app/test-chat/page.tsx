'use client';

import ChatWidget from '@/app/components/ChatWidget';

export default function TestChatPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Chat Widget Test</h1>
      <p className="mb-8">This page tests the chat widget in isolation.</p>

      {/* Test the chat widget with a dummy product */}
      <ChatWidget
        productId="12345678-1234-1234-1234-123456789012"
        productName="Test Product"
        productImage="https://via.placeholder.com/300x200"
        category="electronics"
        isAuthenticated={false} // Test with unauthenticated state
        user={undefined} // No user for testing
      />
    </div>
  );
}
