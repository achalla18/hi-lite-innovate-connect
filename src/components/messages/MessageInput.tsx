
import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  initialMessage: string;
  isMessageRequest: boolean;
  messagesRemaining?: number;
  disabled: boolean;
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ 
  initialMessage, 
  isMessageRequest, 
  messagesRemaining, 
  disabled,
  onSendMessage 
}: MessageInputProps) {
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="p-3 border-t">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isMessageRequest && messagesRemaining !== undefined && messagesRemaining < 3
              ? `Type a message (${messagesRemaining}/3 messages remaining)...`
              : "Type a message..."
          }
          className="hilite-input flex-1"
          disabled={disabled}
        />
        <button
          type="submit"
          className="hilite-btn-primary"
          disabled={!message.trim() || disabled}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      {isMessageRequest && messagesRemaining !== undefined && messagesRemaining <= 0 && (
        <div className="text-xs text-destructive mt-1">
          Message limit reached. Wait for the other user to respond.
        </div>
      )}
    </div>
  );
}
