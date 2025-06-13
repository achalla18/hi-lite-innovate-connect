import { useState, useRef } from "react";
import { Image, Link as LinkIcon, FileText, BarChart4, X, Users, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface CreatePostFormProps {
  clubId?: string;
  repostId?: string;
  repostContent?: string;
  repostUser?: {
    name: string;
    id: string;
  };
  onCancel?: () => void;
}

export default function CreatePostForm({ clubId, repostId, repostContent, repostUser, onCancel }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setContent("");
    setAttachments([]);
    setIsPreviewMode(false);
    if (onCancel) onCancel();
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    Array.from(files).forEach(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: "Only JPEG, PNG, and GIF images are supported",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // For now, we'll just use a placeholder image URL
      // In a real app, you would upload the file to Supabase storage
      setAttachments([...attachments, URL.createObjectURL(file)]);
    });
    
    // Clear the input
    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0 && !repostId) return;
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        user_id: user.id,
        content: content,
        images: attachments.length > 0 ? attachments : null,
        repost_id: repostId || null
      };
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select();
        
      if (error) throw error;
      
      toast({
        title: clubId ? "Club post created" : repostId ? "Reposted successfully" : "Post created",
        description: clubId 
          ? "Your post has been published to the club." 
          : "Your post has been published successfully.",
      });
      
      // Reset form and invalidate posts query to refresh the list
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['homePosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="hilite-card mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "Profile"} />
            <AvatarFallback>
              {profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {repostId && repostContent && repostUser && (
              <div className="mb-3 p-3 border rounded-lg bg-accent/30 relative">
                <div className="text-sm font-medium mb-1">Reposting {repostUser.name}'s post</div>
                <p className="text-sm text-muted-foreground line-clamp-2">{repostContent}</p>
                <Share2 className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          
            {!isPreviewMode ? (
              <textarea
                placeholder={clubId ? "Share something with the club..." : "What's on your mind? Share your innovation..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleFocus}
                className="hilite-input w-full resize-none"
                rows={isExpanded ? 4 : 1}
              ></textarea>
            ) : (
              <div className="hilite-input w-full min-h-[100px] p-3">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
            
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
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              multiple
            />
            
            {isExpanded && (
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={handleAddImage}
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Add image"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Add document"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Add link"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Add poll"
                  >
                    <BarChart4 className="h-5 w-5" />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={togglePreview}
                    className="text-xs"
                  >
                    {isPreviewMode ? "Edit" : "Preview"}
                  </Button>
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
                    disabled={isSubmitting || ((!content.trim() && attachments.length === 0) && !repostId)}
                  >
                    {isSubmitting ? "Posting..." : repostId ? "Repost" : "Post"}
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