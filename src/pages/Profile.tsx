
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import EducationSection from "@/components/profile/EducationSection";
import FeaturedSection from "@/components/profile/FeaturedSection";
import UserClubs from "@/components/profile/UserClubs";
import PostCard from "@/components/post/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const isCurrentUser = true;
  
  // Get user's posts
  const { data: userPosts } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (name, role, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (!data) return [];
      
      // Get post likes in a separate query
      const { data: postLikes } = await supabase
        .from('post_likes')
        .select('post_id, user_id');
      
      return data.map(post => {
        const isLiked = postLikes ? postLikes.some(like => 
          like.post_id === post.id && like.user_id === user?.id
        ) : false;
        
        const likesCount = postLikes ? postLikes.filter(like => like.post_id === post.id).length : 0;
        
        return {
          id: post.id,
          author: {
            id: post.user_id,
            name: post.profiles?.name || 'Anonymous',
            role: post.profiles?.role || '',
            avatarUrl: post.profiles?.avatar_url || '/placeholder.svg'
          },
          content: post.content,
          images: post.images || [],
          likes: likesCount,
          comments: 0, 
          timeAgo: formatTimeAgo(new Date(post.created_at)),
          isLiked
        };
      });
    },
    enabled: !!user
  });
  
  // Get connections count
  const { data: connections } = useQuery({
    queryKey: ['profileConnections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
  
  // Calculate connections added this month
  const connectionsThisMonth = connections?.filter(conn => {
    const createdDate = new Date(conn.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear();
  })?.length || 0;
  
  // Record a profile view when someone views a profile
  useEffect(() => {
    const recordProfileView = async () => {
      if (!user) return;
      
      try {
        // In a real application, we'd check if the viewer is different from profile owner
        // and only record unique views per day
        await supabase.from('profile_views').insert({
          profile_id: user.id,
          viewer_id: user.id, // Just for testing
        });
      } catch (error) {
        console.error('Error recording profile view:', error);
      }
    };
    
    if (!isCurrentUser) {
      recordProfileView();
    }
  }, [user, isCurrentUser]);
  
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
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <ProfileHeader isCurrentUser={isCurrentUser} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar with profile info */}
            <div className="space-y-4">
              <AboutSection isCurrentUser={isCurrentUser} />
              <UserClubs isCurrentUser={isCurrentUser} />
              <FeaturedSection isCurrentUser={isCurrentUser} />
              
              {/* Network Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Your Network</span>
                    {isCurrentUser && (
                      <Link to="/premium" className="text-sm text-hilite-dark-red hover:underline inline-flex items-center">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Get Premium
                      </Link>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-semibold">{connections?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added this month</span>
                    <span className="font-semibold">{connectionsThisMonth}</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Add Education Section with small "Currently Attending" info */}
              <div className="hilite-card">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-bold">Currently Attending</h3>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">Stanford University</span>
                  <span className="mx-2">•</span>
                  <span>Master of Computer Science</span>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <ExperienceSection isCurrentUser={isCurrentUser} />
              <ProjectsSection isCurrentUser={isCurrentUser} />
              
              <h2 className="text-xl font-bold mt-6 mb-4">Posts</h2>
              {userPosts && userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="hilite-card p-6 text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
