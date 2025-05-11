
import { Check, CheckCheck } from "lucide-react";
import { MessageDisplay } from "@/types/message";

interface MessageBubbleProps {
  message: MessageDisplay;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`mb-4 flex ${message.sender === "self" ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[80%] ${message.sender === "self" ? "bg-hilite-purple text-white" : "bg-accent"} rounded-lg px-4 py-2`}>
        <p>{message.text}</p>
        <div className={`text-xs mt-1 flex items-center ${message.sender === "self" ? "text-white/80 justify-end" : "text-muted-foreground"}`}>
          {message.time}
          {message.sender === "self" && (
            <span className="ml-1">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
