'use client';

import { MessageCircle, CheckCircle, MessageSquare, Package } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <MessageCircle className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Admin Chat</h2>
          <p className="text-gray-600 mb-6">Select a conversation to start responding to customer inquiries</p>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-sm text-gray-900">Real-time Messaging</p>
                <p className="text-xs text-gray-600">Instant communication with customers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-sm text-gray-900">Product Support</p>
                <p className="text-xs text-gray-600">Help with product inquiries</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-semibold text-sm text-gray-900">Product Inquiries</p>
                <p className="text-xs text-gray-600">Answer questions about products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
