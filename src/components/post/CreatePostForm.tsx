
import { useState } from "react";
import { Image, Link, FileText, BarChart4, X, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostFormProps {
  clubId?: string;
}

export default function CreatePostForm({ clubId }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setContent("");
    setAttachments([]);
  };

  const handleAddImage = () => {
    // In a real app, this would open a file picker
    // For now, we'll just add a placeholder image
    setAttachments([...attachments, "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&fit=crop"]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate posting
    // In a real app, this would connect to Supabase or another backend
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
      toast({
        title: clubId ? "Club post created" : "Post created",
        description: clubId 
          ? "Your post has been published to the club." 
          : "Your post has been published successfully.",
      });
    }, 1000);
  };

  return (
    <div className="hilite-card mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 p-4">
          <div className="h-10 w-10 rounded-full bg-hilite-gray overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <textarea
              placeholder={clubId ? "Share something with the club..." : "What would you like to share?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              className="hilite-input w-full resize-none"
              rows={isExpanded ? 4 : 1}
            ></textarea>
            
            {attachments.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {attachments.map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden h-32">
                    <img src={url} alt="Attachment" className="h-full w-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="absolute top-1 right-1 bg-background/80 p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {isExpanded && (
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={handleAddImage}
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Link className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <BarChart4 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={handleClose}
                    className="hilite-btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="hilite-btn-primary text-sm"
                    disabled={isSubmitting || (!content.trim() && attachments.length === 0)}
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {clubId && (
          <div className="px-4 pb-3 border-t border-border pt-3 flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>This post will only be visible to club members</span>
          </div>
        )}
      </form>
    </div>
  );
}
