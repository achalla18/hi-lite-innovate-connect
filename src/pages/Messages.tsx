
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageRequest, Conversation, MessageDisplay } from "@/types/message";
import ConversationList from "@/components/messages/ConversationList";
import ConversationView from "@/components/messages/ConversationView";
import MobileConversationView from "@/components/messages/MobileConversationView";
import EmptyConversation from "@/components/messages/EmptyConversation";
import * as messageService from "@/services/messageService";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch user connections
  const { data: connections } = useQuery({
    queryKey: ['messageConnections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all accepted connections
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select(`
          id,
          user_id,
          connected_user_id,
          status
        `)
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (error) throw error;
      
      return connectionsData || [];
    },
    enabled: !!user
  });
  
  // Get profile data for connections
  const { data: connectionUsers } = useQuery({
    queryKey: ['connectionProfiles', connections?.length],
    queryFn: async () => {
      if (!connections || connections.length === 0) return [];
      
      // Extract user IDs from connections (excluding the current user)
      const connectionUserIds = connections
        .map(conn => conn.user_id === user?.id ? conn.connected_user_id : conn.user_id)
        .filter(id => id !== user?.id);
        
      if (connectionUserIds.length === 0) return [];
      
      // Get profile data for all connection users
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', connectionUserIds);
        
      if (error) throw error;
      
      return profilesData || [];
    },
    enabled: !!connections && connections.length > 0
  });

  // Get all messages
  const { data: allMessages } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [] as Message[];
      return messageService.getMessages(user.id);
    },
    enabled: !!user,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Get all message requests
  const { data: messageRequests } = useQuery({
    queryKey: ['messageRequests', user?.id],
    queryFn: async () => {
      if (!user) return [] as MessageRequest[];
      return messageService.getMessageRequests(user.id);
    },
    enabled: !!user,
    refetchInterval: 5000
  });
  
  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (newMessage: { content: string, receiver_id: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      // Check if this is the first message to this user
      const existingRequest = messageRequests?.find(
        mr => (mr.sender_id === user.id && mr.receiver_id === newMessage.receiver_id) || 
              (mr.sender_id === newMessage.receiver_id && mr.receiver_id === user.id)
      );
      
      return messageService.sendMessage(
        user.id,
        newMessage.receiver_id,
        newMessage.content,
        existingRequest
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messageRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });
  
  // Accept message request mutation
  const acceptMessageRequest = useMutation({
    mutationFn: async (requestId: string) => {
      return messageService.acceptMessageRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageRequests'] });
      toast.success("Message request accepted");
    },
    onError: () => {
      toast.error("Failed to accept message request");
    }
  });
  
  // Mark messages as read mutation
  const markMessagesAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      if (!user) throw new Error("Not authenticated");
      return messageService.markMessagesAsRead(user.id, senderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
  
  // Group messages by conversation and get last message
  const conversations: Conversation[] = connectionUsers?.map(connectedUser => {
    // Get messages for this conversation
    const conversationMessages = allMessages?.filter(
      msg => (msg.sender_id === user?.id && msg.receiver_id === connectedUser.id) || 
             (msg.sender_id === connectedUser.id && msg.receiver_id === user?.id)
    ) || [];
    
    // Get last message
    const lastMsg = conversationMessages.length > 0 
      ? conversationMessages[conversationMessages.length - 1] 
      : null;
    
    // Count unread messages
    const unreadCount = conversationMessages.filter(
      msg => msg.sender_id === connectedUser.id && !msg.is_read
    ).length;
    
    // Check if there's a message request for this conversation
    const request = messageRequests?.find(
      mr => (mr.sender_id === user?.id && mr.receiver_id === connectedUser.id) || 
            (mr.sender_id === connectedUser.id && mr.receiver_id === user?.id)
    );
    
    let messagesRemaining = 3;
    if (request && request.sender_id === user?.id && request.status === 'pending') {
      messagesRemaining = 3 - request.messages_sent;
    }
    
    return {
      id: connectedUser.id,
      user: {
        id: connectedUser.id,
        name: connectedUser.name || 'User',
        avatarUrl: connectedUser.avatar_url || '/placeholder.svg',
        status: Math.random() > 0.5 ? 'online' : 'offline', // Randomize for demo
      },
      lastMessage: lastMsg ? lastMsg.content : "Start a conversation",
      time: lastMsg ? formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: true }) : "",
      unread: unreadCount,
      isMessageRequest: request?.status === 'pending',
      messageRequestId: request?.id,
      messagesRemaining: messagesRemaining
    };
  }) || [];

  // Set the first conversation as selected by default
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);
  
  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (user && selectedConversation) {
      markMessagesAsRead.mutate(selectedConversation);
    }
  }, [selectedConversation, user]);
  
  // Get the selected conversation data
  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  
  // Get messages for the selected conversation
  const selectedMessages: MessageDisplay[] = selectedConversation ? 
    allMessages?.filter(
      msg => (msg.sender_id === user?.id && msg.receiver_id === selectedConversation) || 
             (msg.sender_id === selectedConversation && msg.receiver_id === user?.id)
    ).map(msg => ({
      id: msg.id,
      sender: msg.sender_id === user?.id ? "self" : "other",
      text: msg.content,
      time: formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }),
      isRead: msg.is_read
    })) : [];
  
  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return;
    
    sendMessage.mutate({
      content: content,
      receiver_id: selectedConversation
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="bg-card border rounded-lg shadow-sm h-[calc(100vh-12rem)] flex overflow-hidden">
          {/* Conversations List */}
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
          
          {/* Conversation View */}
          {selectedConversation && selectedConversationData ? (
            <>
              <ConversationView
                currentUserId={user?.id}
                selectedConversation={selectedConversationData}
                messages={selectedMessages}
                onSendMessage={handleSendMessage}
                onAcceptRequest={(requestId) => acceptMessageRequest.mutate(requestId)}
              />
              
              <MobileConversationView
                currentUserId={user?.id}
                selectedConversation={selectedConversationData}
                messages={selectedMessages}
                onBack={() => setSelectedConversation(null)}
                onSendMessage={handleSendMessage}
                onAcceptRequest={(requestId) => acceptMessageRequest.mutate(requestId)}
              />
            </>
          ) : (
            <EmptyConversation />
          )}
        </div>
      </main>
    </div>
  );
}
