
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/post/PostCard";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Search, Hash, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Function to extract hashtags from text
const extractHashtags = (text: string) => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  return text.match(hashtagRegex) || [];
};

export default function Discover() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  
  // Fetch all posts
  const { data: allPosts, isLoading } = useQuery({
    queryKey: ['discover-posts'],
    queryFn: async () => {
      // First, get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      if (!postsData) return { posts: [], hashtags: {} };
      
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
      
      // Create a hashtag counter
      const hashtagCounter: Record<string, number> = {};
      
      // Map posts with author information and like/comment counts
      const formattedPosts = postsData.map(post => {
        const authorProfile = profilesData?.find(profile => profile.id === post.user_id) || {
          name: 'Anonymous',
          role: '',
          avatar_url: '/placeholder.svg'
        };
        
        // Extract hashtags from the post content
        const hashtags = extractHashtags(post.content);
        
        // Count hashtags
        hashtags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          hashtagCounter[normalizedTag] = (hashtagCounter[normalizedTag] || 0) + 1;
        });
        
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
          hashtags,
          images: post.images || [],
          likes: likesCount,
          comments: commentsCount,
          timeAgo: formatTimeAgo(new Date(post.created_at)),
          isLiked
        };
      });
      
      return { 
        posts: formattedPosts,
        hashtags: hashtagCounter
      };
    },
    enabled: !!user
  });
  
  // Filter posts by hashtag or search term
  const filteredPosts = allPosts?.posts.filter(post => {
    if (selectedHashtag) {
      return post.hashtags.some(tag => 
        tag.toLowerCase() === selectedHashtag.toLowerCase()
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        post.content.toLowerCase().includes(term) ||
        post.author.name.toLowerCase().includes(term) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return true;
  }) || [];
  
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
  
  // Get trending hashtags (sorted by count)
  const trendingHashtags = allPosts ? 
    Object.entries(allPosts.hashtags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count })) : 
    [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Discover</h1>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts, hashtags, or users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedHashtag(null);
                  }}
                  className="pl-9"
                />
              </div>
              
              {selectedHashtag && (
                <div className="mb-4 flex items-center">
                  <Badge variant="secondary" className="text-md mr-2">
                    <Hash className="h-3 w-3 mr-1" />
                    {selectedHashtag}
                  </Badge>
                  <button 
                    onClick={() => setSelectedHashtag(null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
            
            <Tabs defaultValue="trending">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="trending" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="latest" className="flex-1">
                  Latest
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trending" className="space-y-4">
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts
                    .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
                    .map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                ) : (
                  <div className="hilite-card p-8 text-center">
                    <h3 className="text-lg font-bold mb-2">No posts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedHashtag ? 
                        `No posts with hashtag ${selectedHashtag}` : 
                        searchTerm ? 
                          `No posts matching "${searchTerm}"` : 
                          "No trending posts yet"}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="latest" className="space-y-4">
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="hilite-card p-8 text-center">
                    <h3 className="text-lg font-bold mb-2">No posts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedHashtag ? 
                        `No posts with hashtag ${selectedHashtag}` : 
                        searchTerm ? 
                          `No posts matching "${searchTerm}"` : 
                          "No posts yet"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  Trending Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="animate-pulse flex items-center justify-between">
                        <div className="h-5 bg-hilite-gray rounded w-24"></div>
                        <div className="h-5 bg-hilite-gray rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                ) : trendingHashtags.length > 0 ? (
                  <div className="space-y-2">
                    {trendingHashtags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedHashtag(tag);
                          setSearchTerm('');
                        }}
                        className="flex items-center justify-between w-full p-2 text-left rounded-md hover:bg-accent"
                      >
                        <span className="font-medium text-hilite-purple">
                          {tag}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} {count === 1 ? 'post' : 'posts'}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Hash className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No trending hashtags yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Discover By Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['#tech', '#career', '#education', '#programming', '#design', '#business', '#marketing'].map(topic => (
                    <Badge 
                      key={topic} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        setSelectedHashtag(topic);
                        setSearchTerm('');
                      }}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
