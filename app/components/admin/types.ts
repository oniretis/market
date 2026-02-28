export interface Message {
  id: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
  conversationId: string;
  Sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isOnline?: boolean;
    profileImage?: string;
  };
  Product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  Message: Message[];
  _count: {
    Message: number;
  };
}
