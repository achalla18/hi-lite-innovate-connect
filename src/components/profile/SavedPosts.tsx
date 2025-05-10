
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/post/PostCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark } from "lucide-react";

export default function SavedPosts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  
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
  
  // Fetch saved posts
  const { data: savedPosts = [], isLoading } = useQuery({
    queryKey: ['savedPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get all saved posts for this user
      const { data: savedPostsData, error } = await supabase
        .from('saved_posts')
        .select('post_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (!savedPostsData || savedPostsData.length === 0) return [];
      
      // Then get the actual posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', savedPostsData.map(saved => saved.post_id));
        
      if (postsError) throw postsError;
      
      // Get user profile data for each post
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      // Get post likes
      const { data: postLikes } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postsData.map(post => post.id));

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

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Saved Items
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-muted-foreground/20 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedPosts.length > 0 ? (
              savedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="font-medium mb-1">No saved posts yet</p>
                <p className="text-sm">Items you save will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
