
import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { Conversation } from "@/types/message";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  return (
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
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-accent ${
                selectedConversation === conv.id ? "bg-accent" : ""
              }`}
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
  );
}
