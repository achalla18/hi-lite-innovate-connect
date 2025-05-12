
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Share2, Bookmark, Flag, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "./CommentSection";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ReportPostDialog from "./ReportPostDialog";

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
    isLiked: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  // Check if post is saved
  const { data: isSaved = false } = useQuery({
    queryKey: ['savedPost', post.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user
  });

  // Check if user is admin/moderator
  const { data: isModOrAdmin = false } = useQuery({
    queryKey: ['isModOrAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase.rpc('is_mod_or_admin', { user_id: user.id });
      return !!data;
    },
    enabled: !!user
  });
  
  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to like posts");
      
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({
            post_id: post.id,
            user_id: user.id
          });
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ 
            post_id: post.id, 
            user_id: user.id 
          });
          
        if (error) throw error;
      }
      
      // Invalidate queries to refresh data
      return queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onMutate: () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: (error) => {
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error(`Failed to ${isLiked ? 'unlike' : 'like'} post: ${error.message}`);
    }
  });
  
  // Toggle save mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to save posts");
      
      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .match({
            post_id: post.id,
            user_id: user.id
          });
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ 
            post_id: post.id, 
            user_id: user.id 
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPost', post.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts', user?.id] });
      toast.success(isSaved ? "Post removed from saved items" : "Post saved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to ${isSaved ? 'unsave' : 'save'} post: ${error.message}`);
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to delete posts");
      if (!isModOrAdmin && user.id !== post.author.id) {
        throw new Error("You don't have permission to delete this post");
      }
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    }
  });
  
  const toggleLike = () => {
    if (!user) {
      toast("Please log in to like posts", {
        description: "Sign in to interact with content"
      });
      return;
    }
    toggleLikeMutation.mutate();
  };
  
  const toggleSave = () => {
    if (!user) {
      toast("Please log in to save posts", {
        description: "Sign in to save content to your profile"
      });
      return;
    }
    toggleSaveMutation.mutate();
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      deletePostMutation.mutate();
    }
  };
  
  return (
    <div className="bg-card p-4 rounded-lg mb-4 border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <Link to={`/profile/${post.author.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-semibold hover:text-hilite-dark-red">
              {post.author.name}
            </Link>
            <p className="text-sm text-muted-foreground">{post.author.role}</p>
            <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleSave}>
              <Bookmark className="mr-2 h-4 w-4" />
              {isSaved ? "Unsave post" : "Save post"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
              <Flag className="mr-2 h-4 w-4" />
              Report post
            </DropdownMenuItem>
            {(isModOrAdmin || (user && user.id === post.author.id)) && (
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mb-4">
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
      </div>
      
      {post.images && post.images.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-2">
          {post.images.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Post image ${index + 1}`} 
              className="rounded-lg max-h-96 w-full object-cover"
            />
          ))}
        </div>
      )}
      
      <div className="flex justify-between text-sm text-muted-foreground pt-2">
        <div className="flex items-center space-x-1">
          <Heart className="h-4 w-4 text-hilite-dark-red" />
          <span>{likesCount}</span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className="hover:underline"
            onClick={() => setShowComments(!showComments)}
          >
            {post.comments} comments
          </button>
          <span>0 shares</span>
        </div>
      </div>
      
      <div className="border-t border-border mt-3 pt-3 flex justify-between">
        <button 
          className={`flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent ${isLiked ? 'text-hilite-dark-red' : ''}`}
          onClick={toggleLike}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-hilite-dark-red' : ''}`} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>
        
        <button 
          className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Comment</span>
        </button>
        
        <button 
          className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent"
          onClick={toggleSave}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        
        <button className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
      
      {showComments && (
        <div className="mt-4">
          <CommentSection postId={post.id} />
        </div>
      )}
      
      <ReportPostDialog 
        isOpen={reportDialogOpen}
        setIsOpen={setReportDialogOpen} 
        postId={post.id}
      />
    </div>
  );
}
