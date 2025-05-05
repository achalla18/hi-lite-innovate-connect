
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClubMessage } from "@/types/club";

interface ClubChatPanelProps {
  clubId: string;
}

// Mock chat messages
const initialMessages: ClubMessage[] = [
  {
    id: "1",
    clubId: "1",
    senderId: "user1",
    senderName: "Alex Chen",
    senderAvatar: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop",
    content: "Welcome everyone to the JavaScript Enthusiasts club! Feel free to share resources, ask questions, and connect with fellow JS developers.",
    createdAt: "2023-06-01T09:00:00Z"
  },
  {
    id: "2",
    clubId: "1",
    senderId: "user2",
    senderName: "Jamie Rodriguez",
    senderAvatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop",
    content: "Thanks for creating this group, Alex! I'm currently working on a project with React and TypeScript. Has anyone here used the new React Server Components?",
    createdAt: "2023-06-01T09:15:00Z"
  },
  {
    id: "3",
    clubId: "1",
    senderId: "user3",
    senderName: "Taylor Kim",
    senderAvatar: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop",
    content: "Yes! I've been experimenting with them. They're quite interesting for data-heavy components. Happy to share my experience if you'd like.",
    createdAt: "2023-06-01T09:20:00Z"
  },
  {
    id: "4",
    clubId: "1",
    senderId: "user1",
    senderName: "Alex Chen",
    senderAvatar: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop",
    content: "That would be amazing, Taylor! Maybe you could share some code examples or patterns you've found useful?",
    createdAt: "2023-06-01T09:25:00Z"
  }
];

export default function ClubChatPanel({ clubId }: ClubChatPanelProps) {
  const [messages, setMessages] = useState<ClubMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to the server
    const message: ClubMessage = {
      id: Date.now().toString(),
      clubId,
      senderId: "current-user",
      senderName: "Jane Thompson",
      senderAvatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop",
      content: newMessage.trim(),
      createdAt: new Date().toISOString()
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="hilite-card flex flex-col h-[calc(70vh-80px)]">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold">Club Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[75%] ${message.senderId === 'current-user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div 
                className={`h-8 w-8 rounded-full overflow-hidden flex-shrink-0 ${message.senderId === 'current-user' ? 'ml-2' : 'mr-2'}`}
              >
                <img 
                  src={message.senderAvatar} 
                  alt={message.senderName} 
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div>
                <div className="flex items-baseline mb-1">
                  <span className={`text-xs font-bold ${message.senderId === 'current-user' ? 'text-right mr-2' : 'ml-1'}`}>
                    {message.senderName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                
                <div 
                  className={`rounded-lg px-3 py-2 ${
                    message.senderId === 'current-user' 
                      ? 'bg-hilite-purple text-white rounded-tr-none' 
                      : 'bg-accent rounded-tl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-border">
        <div className="flex items-end">
          <div className="flex-1">
            <textarea
              className="hilite-input w-full resize-none"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          
          <div className="flex items-center ml-2">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent">
              <Image className="h-5 w-5" />
            </button>
            <button 
              className="p-2 text-white bg-hilite-purple rounded-full ml-1 hover:bg-hilite-purple/90"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
