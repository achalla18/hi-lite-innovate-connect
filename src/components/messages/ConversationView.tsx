
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Video, MoreVertical } from "lucide-react";
import MessageRequestAlert from "./MessageRequestAlert";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Conversation, MessageDisplay } from "@/types/message";

interface ConversationViewProps {
  currentUserId: string | undefined;
  selectedConversation: Conversation;
  messages: MessageDisplay[];
  onSendMessage: (content: string) => void;
  onAcceptRequest: (requestId: string) => void;
}

export default function ConversationView({
  currentUserId,
  selectedConversation,
  messages,
  onSendMessage,
  onAcceptRequest,
}: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    onSendMessage(content);
  };

  return (
    <div className="hidden md:flex flex-col flex-1">
      {/* Conversation Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${selectedConversation.user.id}`} className="h-10 w-10 rounded-full bg-hilite-gray overflow-hidden">
            <img
              src={selectedConversation.user.avatarUrl}
              alt={selectedConversation.user.name}
              className="h-full w-full object-cover"
            />
          </Link>
          <div>
            <Link to={`/profile/${selectedConversation.user.id}`} className="font-bold">
              {selectedConversation.user.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {selectedConversation.user.status === "online" ? "Online" : "Offline"}
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
        {selectedConversation.isMessageRequest && selectedConversation.messageRequestId && (
          <MessageRequestAlert
            currentUserId={currentUserId}
            selectedConversationId={selectedConversation.id}
            userName={selectedConversation.user.name}
            messagesSent={3 - (selectedConversation.messagesRemaining || 0)}
            messagesRemaining={selectedConversation.messagesRemaining || 0}
            messageRequestId={selectedConversation.messageRequestId}
            onAcceptRequest={onAcceptRequest}
          />
        )}
        
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput
        initialMessage={message}
        isMessageRequest={selectedConversation.isMessageRequest}
        messagesRemaining={selectedConversation.messagesRemaining}
        disabled={
          selectedConversation.isMessageRequest &&
          selectedConversation.messagesRemaining !== undefined &&
          selectedConversation.messagesRemaining <= 0
        }
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
