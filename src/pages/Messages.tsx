
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Search, Send, Phone, Video, MoreVertical, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
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
}

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  
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
  
  // Combine connection and profile data to create conversations
  const conversations: Conversation[] = connectionUsers?.map(profile => ({
    id: profile.id,
    user: {
      id: profile.id,
      name: profile.name || 'User',
      avatarUrl: profile.avatar_url || '/placeholder.svg',
      status: Math.random() > 0.5 ? 'online' : 'offline', // Randomize for demo
    },
    lastMessage: "Click to start a conversation",
    time: "Just now",
    unread: 0
  })) || [];
  
  // Set the first conversation as selected by default
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);
  
  // Get the selected conversation data
  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  
  // In a real app, we would fetch real messages from a database
  // For now, we'll generate sample messages based on the selected user
  const selectedMessages = selectedConversation ? [
    {
      id: "msg1",
      sender: selectedConversation === conversations[0]?.id ? "other" : "self",
      text: `Hi there! This is a sample message to demonstrate the UI. In a real app, these messages would come from the database.`,
      time: "10 minutes ago"
    },
    {
      id: "msg2",
      sender: "self",
      text: "Hi! This is a demonstration of the messaging interface. Messages are not yet stored in the database.",
      time: "5 minutes ago"
    },
    {
      id: "msg3",
      sender: selectedConversation === conversations[0]?.id ? "self" : "other",
      text: "To build a complete messaging system, we would need to create database tables for storing messages and implement real-time functionality.",
      time: "Just now"
    }
  ] : [];
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;
    
    // In a real app, we would send the message to the database
    toast.success("Message functionality will be implemented in the next phase");
    setMessage("");
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
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
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
                {selectedMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${msg.sender === "self" ? "bg-hilite-purple text-white" : "bg-accent"} rounded-lg px-4 py-2`}>
                      <p>{msg.text}</p>
                      <div className={`text-xs mt-1 ${msg.sender === "self" ? "text-white/80" : "text-muted-foreground"}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="hilite-input flex-1"
                  />
                  <button
                    type="submit"
                    className="hilite-btn-primary"
                    disabled={!message.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
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
                {selectedMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${msg.sender === "self" ? "bg-hilite-purple text-white" : "bg-accent"} rounded-lg px-3 py-2`}>
                      <p className="text-sm">{msg.text}</p>
                      <div className={`text-xs mt-1 ${msg.sender === "self" ? "text-white/80" : "text-muted-foreground"}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobile Message Input */}
              <div className="p-2 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="hilite-input flex-1"
                  />
                  <button
                    type="submit"
                    className="hilite-btn-primary"
                    disabled={!message.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
