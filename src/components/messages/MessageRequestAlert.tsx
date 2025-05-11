
import { Clock, Check } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MessageRequestAlertProps {
  currentUserId: string | undefined;
  selectedConversationId: string | null;
  userName: string;
  messagesSent: number;
  messagesRemaining: number;
  messageRequestId: string;
  onAcceptRequest: (requestId: string) => void;
}

export default function MessageRequestAlert({
  currentUserId,
  selectedConversationId,
  userName,
  messagesSent,
  messagesRemaining,
  messageRequestId,
  onAcceptRequest,
}: MessageRequestAlertProps) {
  return (
    <Alert className="mb-4 border-hilite-purple bg-hilite-purple/5">
      <AlertTitle className="flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        Message Request
      </AlertTitle>
      <AlertDescription className="space-y-2">
        {currentUserId === selectedConversationId ? (
          <p>This is a message request. You've sent {messagesSent}/3 messages.</p>
        ) : (
          <p>You've received a message request from {userName}.</p>
        )}
        
        {currentUserId !== selectedConversationId && (
          <Button 
            size="sm" 
            className="bg-hilite-purple hover:bg-hilite-purple/90"
            onClick={() => onAcceptRequest(messageRequestId)}
          >
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
