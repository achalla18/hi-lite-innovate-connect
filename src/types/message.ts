
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  messages_sent: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
    status: 'online' | 'offline';
  };
  lastMessage: string;
  time: string;
  unread: number;
  isMessageRequest: boolean;
  messageRequestId?: string;
  messagesRemaining?: number;
}
