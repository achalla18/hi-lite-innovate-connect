
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, MoreVertical, Clock, Check, CheckCheck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import MessageInput from "./MessageInput";
import { Conversation, MessageDisplay } from "@/types/message";

interface MobileConversationViewProps {
  currentUserId: string | undefined;
  selectedConversation: Conversation;
  messages: MessageDisplay[];
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onAcceptRequest: (requestId: string) => void;
}

export default function MobileConversationView({
  currentUserId,
  selectedConversation,
  messages,
  onBack,
  onSendMessage,
  onAcceptRequest,
}: MobileConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="md:hidden flex flex-col flex-1">
      {/* Mobile Conversation Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <Link to={`/profile/${selectedConversation.user.id}`} className="h-8 w-8 rounded-full bg-hilite-gray overflow-hidden">
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
        {selectedConversation.isMessageRequest && selectedConversation.messageRequestId && (
          <Alert className="mb-3 border-hilite-purple bg-hilite-purple/5 text-sm">
            <AlertTitle className="text-sm flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Message Request
            </AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              {currentUserId === selectedConversation.id ? (
                <p>This is a message request. You've sent {3 - (selectedConversation.messagesRemaining || 0)}/3 messages.</p>
              ) : (
                <p>Message request from {selectedConversation.user.name}.</p>
              )}
              
              {currentUserId !== selectedConversation.id && (
                <Button 
                  size="sm" 
                  className="bg-hilite-purple hover:bg-hilite-purple/90 text-xs py-1 h-7"
                  onClick={() => onAcceptRequest(selectedConversation.messageRequestId!)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {messages && messages.length > 0 ? (
          messages.map(msg => (
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
      <MessageInput
        initialMessage=""
        isMessageRequest={selectedConversation.isMessageRequest}
        messagesRemaining={selectedConversation.messagesRemaining}
        disabled={
          selectedConversation.isMessageRequest && 
          selectedConversation.messagesRemaining !== undefined && 
          selectedConversation.messagesRemaining <= 0
        }
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
