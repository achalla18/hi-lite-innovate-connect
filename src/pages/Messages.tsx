
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Search, Send, Phone, Video, MoreVertical, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("conv1");
  const [message, setMessage] = useState("");
  
  // Mock conversations
  const conversations = [
    {
      id: "conv1",
      user: {
        id: "user1",
        name: "Alex Chen",
        avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop",
        status: "online"
      },
      lastMessage: "Would you like to review my latest PR?",
      time: "10:32 AM",
      unread: 2
    },
    {
      id: "conv2",
      user: {
        id: "user2",
        name: "Jamie Rodriguez",
        avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop",
        status: "offline"
      },
      lastMessage: "Thanks for the feedback!",
      time: "Yesterday",
      unread: 0
    },
    {
      id: "conv3",
      user: {
        id: "user3",
        name: "Taylor Kim",
        avatarUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop",
        status: "online"
      },
      lastMessage: "Let's catch up sometime this week",
      time: "Monday",
      unread: 0
    }
  ];
  
  // Mock messages for selected conversation
  const messages = {
    conv1: [
      {
        id: "msg1",
        sender: "other",
        text: "Hey, I just pushed a new feature and created a PR. Could you take a look when you have a moment?",
        time: "10:30 AM"
      },
      {
        id: "msg2",
        sender: "other",
        text: "Would you like to review my latest PR?",
        time: "10:32 AM"
      },
      {
        id: "msg3",
        sender: "self",
        text: "Sure thing! I'm finishing up something right now, but I'll take a look at your PR in about an hour if that works?",
        time: "10:35 AM"
      }
    ],
    conv2: [
      {
        id: "msg1",
        sender: "self",
        text: "Hey Jamie, I took a look at your designs. I think they look great, but I have a few suggestions about the navigation flow.",
        time: "Yesterday, 3:15 PM"
      },
      {
        id: "msg2",
        sender: "other",
        text: "Thanks for the feedback!",
        time: "Yesterday, 3:30 PM"
      }
    ],
    conv3: [
      {
        id: "msg1",
        sender: "other",
        text: "Hi! Hope you're doing well. It's been a while since we caught up.",
        time: "Monday, 2:15 PM"
      },
      {
        id: "msg2",
        sender: "other",
        text: "Let's catch up sometime this week",
        time: "Monday, 2:16 PM"
      },
      {
        id: "msg3",
        sender: "self",
        text: "Hey! Great to hear from you. I've been swamped with work, but I'd love to catch up. How about coffee on Thursday?",
        time: "Monday, 5:22 PM"
      }
    ]
  };
  
  const selectedMessages = selectedConversation ? messages[selectedConversation as keyof typeof messages] : [];
  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;
    // In a real app, this would send the message to the backend
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
              {conversations.map(conv => (
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
              ))}
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
