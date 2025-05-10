
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ReportCommentDialogProps {
  isOpen: boolean;
  commentId: string;
  onClose: () => void;
}

const reportReasons = [
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "spam", label: "Spam or misleading" },
  { id: "harmful", label: "Harmful or dangerous content" },
  { id: "hateful", label: "Hateful or abusive content" },
  { id: "other", label: "Other" }
];

export default function ReportCommentDialog({ isOpen, commentId, onClose }: ReportCommentDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to report content");
      if (!reason) throw new Error("Please select a reason for reporting");
      
      const reportContent = reason === "other" && additionalInfo
        ? additionalInfo
        : reportReasons.find(r => r.id === reason)?.label || reason;
      
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          content_type: 'comment',
          content_id: commentId,
          reason: reportContent
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report submitted successfully. Our team will review it soon.");
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to submit report: ${error.message}`);
    }
  });
  
  const resetForm = () => {
    setReason("");
    setAdditionalInfo("");
  };
  
  const handleSubmit = () => {
    reportMutation.mutate();
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
          <DialogDescription>
            Please tell us why you're reporting this comment. This will help us review it faster.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {reportReasons.map((reportReason) => (
              <div key={reportReason.id} className="flex items-start space-x-2">
                <RadioGroupItem value={reportReason.id} id={`comment-${reportReason.id}`} />
                <Label htmlFor={`comment-${reportReason.id}`} className="font-normal">
                  {reportReason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {reason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="commentAdditionalInfo">Please provide more details</Label>
              <Textarea
                id="commentAdditionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Please explain why you are reporting this comment"
                className="min-h-[100px]"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || (reason === "other" && !additionalInfo) || reportMutation.isPending}
          >
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
