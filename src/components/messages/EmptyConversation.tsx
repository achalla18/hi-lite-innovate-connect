
import { Send } from "lucide-react";

export default function EmptyConversation() {
  return (
    <div className="hidden md:flex flex-col flex-1 items-center justify-center p-6 text-center">
      <div className="mb-4 p-4 rounded-full bg-hilite-light-purple">
        <Send className="h-8 w-8 text-hilite-purple" />
      </div>
      <h2 className="text-xl font-bold mb-2">Your Messages</h2>
      <p className="text-muted-foreground max-w-md">
        Select a conversation to start chatting or connect with your network to send new messages.
      </p>
    </div>
  );
}
