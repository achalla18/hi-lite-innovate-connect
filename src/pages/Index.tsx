import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import CreatePostForm from "@/components/post/CreatePostForm";
import PostCard from "@/components/post/PostCard";
import NetworkSuggestions from "@/components/home/NetworkSuggestions";
import TrendingTopics from "@/components/home/TrendingTopics";
import UserStats from "@/components/home/UserStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  const { user, profile } = useAuth();

  // Format time ago helper function
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return 'just now';
  };

  // Fetch posts for the home feed
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['homePosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all posts (in a real app, this would be filtered by connections)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) return [];
      
      // Get user profile data for each post
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      // Get post likes
      const { data: postLikes } = await supabase
        .from('post_likes')
        .select('post_id, user_id');

      // Get post comments counts
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id');
      
      // Map posts with author information and like/comment counts
      return postsData.map(post => {
        const authorProfile = profilesData?.find(profile => profile.id === post.user_id) || {
          name: 'Anonymous',
          role: '',
          avatar_url: '/placeholder.svg'
        };
        
        const isLiked = postLikes ? postLikes.some(like => 
          like.post_id === post.id && like.user_id === user.id
        ) : false;
        
        const likesCount = postLikes ? postLikes.filter(like => like.post_id === post.id).length : 0;
        const commentsCount = commentsData ? commentsData.filter(comment => comment.post_id === post.id).length : 0;
        
        return {
          id: post.id,
          author: {
            id: post.user_id,
            name: authorProfile.name || 'Anonymous',
            role: authorProfile.role || '',
            avatarUrl: authorProfile.avatar_url || '/placeholder.svg'
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
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <UserStats />
            <TrendingTopics />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome message for new users */}
            {!profile?.name && (
              <div className="hilite-card text-center">
                <h2 className="text-xl font-bold mb-2">Welcome to Hi-Lite!</h2>
                <p className="text-muted-foreground mb-4">
                  Complete your profile to start connecting with other high school innovators.
                </p>
                <Link to="/profile-setup">
                  <Button className="bg-hilite-dark-red hover:bg-hilite-dark-red/90">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Create Post */}
            <CreatePostForm />

            {/* Posts Feed */}
            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="hilite-card p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-hilite-gray rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-hilite-gray rounded w-1/3"></div>
                        <div className="h-3 bg-hilite-gray rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-hilite-gray rounded"></div>
                      <div className="h-4 bg-hilite-gray rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="hilite-card text-center py-8">
                <h3 className="text-lg font-bold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start connecting with other students and share your ideas to see posts in your feed.
                </p>
                <div className="space-x-2">
                  <Link to="/discover">
                    <Button variant="outline">Discover Posts</Button>
                  </Link>
                  <Link to="/network">
                    <Button className="bg-hilite-dark-red hover:bg-hilite-dark-red/90">
                      Find Connections
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <NetworkSuggestions />
          </div>
        </div>
      </main>
    </div>
  );
}