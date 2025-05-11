import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Search, Send, Phone, Video, MoreVertical, X, Check, Clock, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Message, MessageRequest, Conversation } from "@/types/message";

export default function Messages() {
  const { user, profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  const { data: allMessages } = useQuery<Message[]>({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Get all message requests
  const { data: messageRequests } = useQuery<MessageRequest[]>({
    queryKey: ['messageRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('message_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
      if (error) throw error;
      
      return data || [];
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
      
      let requestId = existingRequest?.id;
      let messagesRemaining = 3;
      
      // If no existing request and not sending to self
      if (!existingRequest && user.id !== newMessage.receiver_id) {
        // Create a new message request
        const { data: newRequest, error: requestError } = await supabase
          .from('message_requests')
          .insert({
            sender_id: user.id,
            receiver_id: newMessage.receiver_id,
            status: 'pending',
            messages_sent: 1
          })
          .select()
          .single();
          
        if (requestError) throw requestError;
        
        requestId = newRequest.id;
        messagesRemaining = 2; // 3 messages allowed, 1 used
      } 
      // If existing request initiated by the current user and still pending
      else if (existingRequest && existingRequest.sender_id === user.id && existingRequest.status === 'pending') {
        // Increment messages_sent
        if (existingRequest.messages_sent >= 3) {
          throw new Error("Message request limit reached. Wait for the other user to respond.");
        }
        
        const { error: updateError } = await supabase
          .from('message_requests')
          .update({ messages_sent: existingRequest.messages_sent + 1 })
          .eq('id', existingRequest.id);
          
        if (updateError) throw updateError;
        
        messagesRemaining = 3 - (existingRequest.messages_sent + 1);
      }
      // If the request is 'accepted' or initiated by the other user, no need to update request
      
      // Finally, insert the actual message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: newMessage.receiver_id,
          content: newMessage.content
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return { message: data, messagesRemaining, requestStatus: existingRequest?.status || 'pending' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messageRequests'] });
      setMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });
  
  // Accept message request mutation
  const acceptMessageRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('message_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      return requestId;
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
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      return senderId;
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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);
  
  // Get the selected conversation data
  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  
  // Get messages for the selected conversation
  const selectedMessages = selectedConversation ? 
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
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;
    
    sendMessage.mutate({
      content: message,
      receiver_id: selectedConversation
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="bg-card border rounded-lg shadow-sm h-[calc(100vh-12rem)] flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-full md:w-80 border-r">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search messages..."
                  className="hilite-input w-full pl-10"
                />
              </div>
            </div>
            
            <div className="h-[calc(100vh-15rem)] overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-accent ${selectedConversation === conv.id ? 'bg-accent' : ''}`}
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-hilite-gray overflow-hidden">
                        <img
                          src={conv.user.avatarUrl}
                          alt={conv.user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {conv.user.status === "online" && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold truncate">{conv.user.name}</h3>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate flex items-center">
                          {conv.isMessageRequest && <Clock className="h-3 w-3 mr-1 text-hilite-purple" />}
                          {conv.lastMessage}
                        </p>
                        {conv.unread > 0 && (
                          <span className="bg-hilite-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Connect with other users to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Conversation View */}
          {selectedConversation ? (
            <div className="hidden md:flex flex-col flex-1">
              {/* Conversation Header */}
              <div className="p-3 border-b flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${selectedConversationData?.user.id}`} className="h-10 w-10 rounded-full bg-hilite-gray overflow-hidden">
                    <img
                      src={selectedConversationData?.user.avatarUrl}
                      alt={selectedConversationData?.user.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link to={`/profile/${selectedConversationData?.user.id}`} className="font-bold">
                      {selectedConversationData?.user.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversationData?.user.status === "online" ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Message request notification */}
                {selectedConversationData?.isMessageRequest && selectedConversationData?.messageRequestId && (
                  <Alert className="mb-4 border-hilite-purple bg-hilite-purple/5">
                    <AlertTitle className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Message Request
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      {user?.id === selectedConversation ? (
                        <p>This is a message request. You've sent {3 - (selectedConversationData?.messagesRemaining || 0)}/3 messages.</p>
                      ) : (
                        <p>You've received a message request from {selectedConversationData?.user.name}.</p>
                      )}
                      
                      {user?.id !== selectedConversation && (
                        <Button 
                          size="sm" 
                          className="bg-hilite-purple hover:bg-hilite-purple/90"
                          onClick={() => acceptMessageRequest.mutate(selectedConversationData.messageRequestId!)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept Request
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {selectedMessages && selectedMessages.length > 0 ? (
                  selectedMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${msg.sender === "self" ? "bg-hilite-purple text-white" : "bg-accent"} rounded-lg px-4 py-2`}>
                        <p>{msg.text}</p>
                        <div className={`text-xs mt-1 flex items-center ${msg.sender === "self" ? "text-white/80 justify-end" : "text-muted-foreground"}`}>
                          {msg.time}
                          {msg.sender === "self" && (
                            <span className="ml-1">
                              {msg.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      selectedConversationData?.isMessageRequest && 
                      selectedConversationData?.messagesRemaining !== undefined && 
                      selectedConversationData?.messagesRemaining < 3
                        ? `Type a message (${selectedConversationData?.messagesRemaining}/3 messages remaining)...`
                        : "Type a message..."
                    }
                    className="hilite-input flex-1"
                    disabled={
                      selectedConversationData?.isMessageRequest && 
                      selectedConversationData?.messagesRemaining !== undefined && 
                      selectedConversationData?.messagesRemaining <= 0
                    }
                  />
                  <button
                    type="submit"
                    className="hilite-btn-primary"
                    disabled={
                      !message.trim() || 
                      (selectedConversationData?.isMessageRequest && 
                       selectedConversationData?.messagesRemaining !== undefined && 
                       selectedConversationData?.messagesRemaining <= 0)
                    }
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                {selectedConversationData?.isMessageRequest && 
                 selectedConversationData?.messagesRemaining !== undefined && 
                 selectedConversationData?.messagesRemaining <= 0 && (
                  <div className="text-xs text-destructive mt-1">
                    Message limit reached. Wait for {selectedConversationData?.user.name} to respond.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-col flex-1 items-center justify-center p-6 text-center">
              <div className="mb-4 p-4 rounded-full bg-hilite-light-purple">
                <Send className="h-8 w-8 text-hilite-purple" />
              </div>
              <h2 className="text-xl font-bold mb-2">Your Messages</h2>
              <p className="text-muted-foreground max-w-md">
                Select a conversation to start chatting or connect with your network to send new messages.
              </p>
            </div>
          )}
          
          {/* Mobile Conversation View */}
          {selectedConversation && (
            <div className="md:hidden flex flex-col flex-1">
              {/* Mobile Conversation Header */}
              <div className="p-3 border-b flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <Link to={`/profile/${selectedConversationData?.user.id}`} className="h-8 w-8 rounded-full bg-hilite-gray overflow-hidden">
                    <img
                      src={selectedConversationData?.user.avatarUrl}
                      alt={selectedConversationData?.user.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link to={`/profile/${selectedConversationData?.user.id}`} className="font-bold">
                      {selectedConversationData?.user.name}
                    </Link>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Messages */}
              <div className="flex-1 p-3 overflow-y-auto">
                {/* Message request notification mobile */}
                {selectedConversationData?.isMessageRequest && selectedConversationData?.messageRequestId && (
                  <Alert className="mb-3 border-hilite-purple bg-hilite-purple/5 text-sm">
                    <AlertTitle className="text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Message Request
                    </AlertTitle>
                    <AlertDescription className="text-xs space-y-2">
                      {user?.id === selectedConversation ? (
                        <p>This is a message request. You've sent {3 - (selectedConversationData?.messagesRemaining || 0)}/3 messages.</p>
                      ) : (
                        <p>Message request from {selectedConversationData?.user.name}.</p>
                      )}
                      
                      {user?.id !== selectedConversation && (
                        <Button 
                          size="sm" 
                          className="bg-hilite-purple hover:bg-hilite-purple/90 text-xs py-1 h-7"
                          onClick={() => acceptMessageRequest.mutate(selectedConversationData.messageRequestId!)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {selectedMessages && selectedMessages.length > 0 ? (
                  selectedMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`mb-3 flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${msg.sender === "self" ? "bg-hilite-purple text-white" : "bg-accent"} rounded-lg px-3 py-2`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`text-xs mt-1 flex items-center ${msg.sender === "self" ? "text-white/80 justify-end" : "text-muted-foreground"}`}>
                          {msg.time}
                          {msg.sender === "self" && (
                            <span className="ml-1">
                              {msg.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Mobile Message Input */}
              <div className="p-2 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      selectedConversationData?.isMessageRequest && 
                      selectedConversationData?.messagesRemaining !== undefined && 
                      selectedConversationData?.messagesRemaining < 3
                        ? `Type (${selectedConversationData?.messagesRemaining}/3 left)...`
                        : "Type a message..."
                    }
                    className="hilite-input flex-1"
                    disabled={
                      selectedConversationData?.isMessageRequest && 
                      selectedConversationData?.messagesRemaining !== undefined && 
                      selectedConversationData?.messagesRemaining <= 0
                    }
                  />
                  <button
                    type="submit"
                    className="hilite-btn-primary"
                    disabled={
                      !message.trim() || 
                      (selectedConversationData?.isMessageRequest && 
                       selectedConversationData?.messagesRemaining !== undefined && 
                       selectedConversationData?.messagesRemaining <= 0)
                    }
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                {selectedConversationData?.isMessageRequest && 
                 selectedConversationData?.messagesRemaining !== undefined && 
                 selectedConversationData?.messagesRemaining <= 0 && (
                  <div className="text-xs text-destructive mt-1">
                    Message limit reached. Wait for a response.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
