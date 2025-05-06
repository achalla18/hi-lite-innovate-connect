
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import CreatePostForm from "@/components/post/CreatePostForm";
import PostCard from "@/components/post/PostCard";
import UserStats from "@/components/home/UserStats";
import NetworkSuggestions from "@/components/home/NetworkSuggestions";
import TrendingTopics from "@/components/home/TrendingTopics";

export default function Index() {
  const { user } = useAuth();
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (name, role, avatar_url),
          post_likes:id (user_id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(post => {
        // Format post data for PostCard component
        const isLiked = post.post_likes?.some(like => like.user_id === user?.id) || false;
        
        return {
          id: post.id,
          author: {
            id: post.user_id,
            name: post.profiles?.name || 'Anonymous',
            role: post.profiles?.role || '',
            avatarUrl: post.profiles?.avatar_url || ''
          },
          content: post.content,
          images: post.images,
          likes: post.post_likes?.length || 0,
          comments: 0, // We'd need another query to get comment count
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Sidebar */}
            <div className="hidden lg:block">
              <UserStats hideIfNotAvailable={true} />
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
            
            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <NetworkSuggestions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
