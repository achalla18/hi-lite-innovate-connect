
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import CreatePostForm from "@/components/post/CreatePostForm";
import PostCard from "@/components/post/PostCard";
import TrendingTopics from "@/components/home/TrendingTopics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // First, get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      if (!postsData) return [];
      
      // Then get user profile data for each post
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
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
        const authorProfile = profilesData?.find(profile => profile.id === post.user_id) || {
          name: 'Anonymous',
          role: '',
          avatar_url: '/placeholder.svg'
        };
        
        const isLiked = postLikes ? postLikes.some(like => 
          like.post_id === post.id && like.user_id === user?.id
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

  // Get user connections count 
  const { data: connectionsCount, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['connectionsCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Sidebar */}
            <div className="hidden lg:block space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Your Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Connections</span>
                      <Link to="/network" className="font-semibold">{connectionsCount || 0}</Link>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Profile Stats</span>
                      <Link to="/premium" className="text-hilite-dark-red hover:underline inline-flex items-center">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Premium
                      </Link>
                    </div>
                    <div className="pt-2">
                      <Link to="/network">
                        <Button variant="outline" className="w-full">Grow your network</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <TrendingTopics />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              <CreatePostForm />
              
              {isLoading ? (
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
                        <div className="h-4 bg-hilite-gray rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="hilite-card p-8 text-center">
                  <h3 className="text-lg font-bold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something with your network
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
