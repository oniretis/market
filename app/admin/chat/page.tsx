import { requireAdmin } from '@/app/lib/admin';
import AdminChatInterface from '@/app/components/admin/AdminChatInterface';

export default function AdminChatPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customer Support Chat</h1>
        <p className="text-gray-600 mt-2">Manage customer conversations and provide support</p>
      </div>
      
      <AdminChatInterface />
    </div>
  );
}
