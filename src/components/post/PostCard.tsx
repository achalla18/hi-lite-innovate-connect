
import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Heart, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      role: string;
      avatarUrl: string;
    };
    content: string;
    images?: string[];
    likes: number;
    comments: number;
    timeAgo: string;
    isLiked?: boolean;
    isSaved?: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleLike = async () => {
    if (!user) return;
    
    try {
      if (isLiked) {
        // Unlike post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleSave = () => {
    // In a real app, this would save the post to the user's saved posts
    setIsSaved(!isSaved);
    
    toast({
      title: isSaved ? "Post removed from saved items" : "Post saved",
      description: isSaved 
        ? "The post has been removed from your saved items." 
        : "The post has been added to your saved items."
    });
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    
    setIsSubmittingComment(true);
    
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: commentText
        });
        
      if (error) throw error;
      
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted."
      });
      
      // Refresh posts to update comment count
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="hilite-card mb-4">
      {/* Post Header */}
      <div className="flex justify-between">
        <div className="flex space-x-3">
          <Link to={`/profile/${post.author.id}`} className="h-10 w-10 rounded-full bg-hilite-gray overflow-hidden">
            <img
              src={post.author.avatarUrl || "https://via.placeholder.com/40"}
              alt={post.author.name}
              className="h-full w-full object-cover"
            />
          </Link>
          
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-bold hover:text-hilite-purple">
              {post.author.name}
            </Link>
            <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:space-x-1">
              <span>{post.author.role}</span>
              <span className="hidden sm:inline">•</span>
              <span>{post.timeAgo}</span>
            </div>
          </div>
        </div>
        
        <button className="text-muted-foreground hover:text-foreground p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="mt-3">
        <p className="whitespace-pre-line">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className={`mt-3 grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {post.images.map((img, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden ${post.images?.length === 1 ? 'col-span-2' : ''}`}
              >
                <img 
                  src={img} 
                  alt={`Post image ${index + 1}`} 
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Stats */}
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <div>{likeCount > 0 && `${likeCount} likes`}</div>
        <div>{post.comments > 0 && `${post.comments} comments`}</div>
      </div>
      
      {/* Post Actions */}
      <div className="mt-2 pt-2 border-t flex justify-between">
        <button 
          onClick={toggleLike}
          className={`flex items-center px-2 py-1 rounded-md hover:bg-accent ${isLiked ? 'text-hilite-purple' : 'text-muted-foreground'}`}
        >
          <Heart className="h-5 w-5 mr-1" fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-sm">Like</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center px-2 py-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <MessageCircle className="h-5 w-5 mr-1" />
          <span className="text-sm">Comment</span>
        </button>
        
        <button 
          onClick={toggleSave}
          className={`flex items-center px-2 py-1 rounded-md hover:bg-accent ${isSaved ? 'text-hilite-purple' : 'text-muted-foreground'}`}
        >
          <Bookmark className="h-5 w-5 mr-1" fill={isSaved ? 'currentColor' : 'none'} />
          <span className="text-sm">Save</span>
        </button>
        
        <button 
          className="flex items-center px-2 py-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Share2 className="h-5 w-5 mr-1" />
          <span className="text-sm">Share</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t">
          <form onSubmit={handleSubmitComment} className="flex space-x-3">
            <div className="h-8 w-8 rounded-full bg-hilite-gray overflow-hidden">
              <img
                src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="flex-1 flex">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="hilite-input w-full"
                disabled={isSubmittingComment}
              />
              <button 
                type="submit" 
                className="ml-2 hilite-btn-primary"
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? "..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
