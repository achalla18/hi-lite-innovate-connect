
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Heart, Reply, Flag, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ReportCommentDialog from "./ReportCommentDialog";

interface CommentSectionProps {
  postId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    name: string;
    role: string;
    avatar_url: string;
  };
  likes: number;
  replies: number;
  isLiked: boolean;
  timeAgo: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportComment, setReportComment] = useState<string | null>(null);

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) {
      return Math.floor(interval) + 'y ago';
    }
    
    interval = seconds / 2592000; // months
    if (interval > 1) {
      return Math.floor(interval) + 'mo ago';
    }
    
    interval = seconds / 86400; // days
    if (interval > 1) {
      return Math.floor(interval) + 'd ago';
    }
    
    interval = seconds / 3600; // hours
    if (interval > 1) {
      return Math.floor(interval) + 'h ago';
    }
    
    interval = seconds / 60; // minutes
    if (interval > 1) {
      return Math.floor(interval) + 'm ago';
    }
    
    return 'just now';
  };

  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      // Get comments for this post
      const { data: commentsData, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get author information
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      // Get comment likes
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('*')
        .in('comment_id', commentsData.map(comment => comment.id));
        
      // Get comment replies count
      const { data: repliesData } = await supabase
        .from('comment_replies')
        .select('parent_id, id')
        .in('parent_id', commentsData.map(comment => comment.id));
        
      // Map comments with author and likes info
      return commentsData.map(comment => {
        const authorProfile = profilesData?.find(profile => profile.id === comment.user_id) || {
          name: 'Anonymous',
          role: '',
          avatar_url: '/placeholder.svg'
        };
        
        const commentLikes = likesData?.filter(like => like.comment_id === comment.id) || [];
        const commentReplies = repliesData?.filter(reply => reply.parent_id === comment.id) || [];
        const isLiked = user ? commentLikes.some(like => like.user_id === user.id) : false;
        
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          author: {
            name: authorProfile.name || 'Anonymous',
            role: authorProfile.role || '',
            avatar_url: authorProfile.avatar_url || '/placeholder.svg'
          },
          likes: commentLikes.length,
          replies: commentReplies.length,
          isLiked,
          timeAgo: formatTimeAgo(new Date(comment.created_at))
        };
      });
    },
    enabled: !!postId
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

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to comment");
      if (!comment.trim()) throw new Error("Comment cannot be empty");
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: comment.trim()
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    }
  });

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to reply");
      if (!replyToId) throw new Error("Invalid reply target");
      if (!replyContent.trim()) throw new Error("Reply cannot be empty");
      
      const { data, error } = await supabase
        .from('comment_replies')
        .insert({
          parent_id: replyToId,
          user_id: user.id,
          content: replyContent.trim()
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setReplyToId(null);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['commentReplies'] });
      toast.success("Reply added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add reply: ${error.message}`);
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string, isLiked: boolean }) => {
      if (!user) throw new Error("You must be logged in to like comments");
      
      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error) => {
      toast.error(`Failed to update like: ${error.message}`);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("You must be logged in to delete comments");
      
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    }
  });

  const handleSubmitComment = () => {
    if (!user) {
      toast("Please log in to comment", {
        description: "Sign in to interact with content"
      });
      return;
    }
    addCommentMutation.mutate();
  };

  const handleSubmitReply = () => {
    if (!user) {
      toast("Please log in to reply", {
        description: "Sign in to interact with content"
      });
      return;
    }
    addReplyMutation.mutate();
  };

  const handleToggleLike = (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast("Please log in to like comments", {
        description: "Sign in to interact with content"
      });
      return;
    }
    toggleLikeMutation.mutate({ commentId, isLiked });
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="mt-2 flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={addCommentMutation.isPending || !comment.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {isLoadingComments ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-2 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-muted"></div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-muted rounded mb-1"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="bg-muted/30 p-3 rounded-md">
                {/* Comment header */}
                <div className="flex justify-between">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar_url} />
                      <AvatarFallback>{comment.author.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{comment.author.name}</div>
                      <div className="text-xs text-muted-foreground">{comment.timeAgo}</div>
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
                      <DropdownMenuItem onClick={() => setReportComment(comment.id)}>
                        <Flag className="mr-2 h-4 w-4" />
                        Report comment
                      </DropdownMenuItem>
                      {(isModOrAdmin || (user && user.id === comment.user_id)) && (
                        <DropdownMenuItem 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete comment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Comment content */}
                <div className="pl-10 mt-1">
                  <p className="text-sm">{comment.content}</p>
                  
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <button
                      className={`flex items-center gap-1 ${comment.isLiked ? 'text-hilite-dark-red' : ''}`}
                      onClick={() => handleToggleLike(comment.id, comment.isLiked)}
                    >
                      <Heart className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-hilite-dark-red' : ''}`} />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                      <span>{comment.isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                    
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                    
                    {comment.replies > 0 && (
                      <button className="flex items-center gap-1">
                        <span>View {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Reply form */}
                  {replyToId === comment.id && (
                    <div className="mt-3 pl-5">
                      <Textarea
                        placeholder={`Replying to ${comment.author.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="mt-2 flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs mr-2"
                          onClick={() => setReplyToId(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs"
                          onClick={handleSubmitReply}
                          disabled={addReplyMutation.isPending || !replyContent.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      )}

      <ReportCommentDialog 
        isOpen={!!reportComment} 
        commentId={reportComment || ''}
        onClose={() => setReportComment(null)}
      />
    </div>
  );
}
