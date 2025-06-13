import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/post/PostCard";

interface UserPostsProps {
  userId: string;
  profileData: any;
}

export default function UserPosts({ userId, profileData }: UserPostsProps) {
  const { user } = useAuth();
  
  // Helper function to format time ago
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

  // Fetch user posts
  const { data: userPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Get all posts for the viewed user
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) return [];
      
      // Get post likes in a separate query
      const { data: postLikes } = await supabase
        .from('post_likes')
        .select('post_id, user_id');
        
      // Get post comments counts
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id');
      
      // Map posts with author information and like/comment counts
      return postsData.map(post => {
        const isLiked = postLikes ? postLikes.some(like => 
          like.post_id === post.id && like.user_id === user?.id
        ) : false;
        
        const likesCount = postLikes ? postLikes.filter(like => like.post_id === post.id).length : 0;
        const commentsCount = commentsData ? commentsData.filter(comment => comment.post_id === post.id).length : 0;
        
        return {
          id: post.id,
          author: {
            id: userId,
            name: profileData?.name || 'Anonymous',
            role: profileData?.role || '',
            avatarUrl: profileData?.avatar_url || '/placeholder.svg'
          },
          content: post.content,
          images: post.images || [],
          likes: likesCount,
          comments: commentsCount,
          timeAgo: formatTimeAgo(new Date(post.created_at)),
          isLiked
        };
      });
    },
    enabled: !!userId && !!profileData
  });

  if (isPostsLoading) {
    return (
      <div className="hilite-card animate-pulse">
        <div className="h-40 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!userPosts || userPosts.length === 0) {
    return null;
  }

  return (
    <div className="hilite-card">
      <h2 className="text-xl font-bold p-4">Activity</h2>
      <div className="divide-y">
        {userPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}