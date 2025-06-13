import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, X } from "lucide-react";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!user || user.email_confirmed_at || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(`Failed to send verification email: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Please verify your email address to access all features. Check your inbox for a verification link.
        </span>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
          >
            {isResending ? "Sending..." : "Resend"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-yellow-800 hover:bg-yellow-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}