import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import FeaturedSection from "@/components/profile/FeaturedSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import PostCard from "@/components/post/PostCard";
import UserClubs from "@/components/profile/UserClubs";

export default function Profile() {
  const { user, profile } = useAuth();
  const isCurrentUser = true;

  const { data: userPosts, isLoading } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First, get all posts for the current user
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) return [];
      
      // Then get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
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
          like.post_id === post.id && like.user_id === user.id
        ) : false;
        
        const likesCount = postLikes ? postLikes.filter(like => like.post_id === post.id).length : 0;
        const commentsCount = commentsData ? commentsData.filter(comment => comment.post_id === post.id).length : 0;
        
        return {
          id: post.id,
          author: {
            id: user.id,
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

  // Get connections count and connections added this month
  const { data: connectionsData } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, thisMonth: 0 };
      
      // Get all accepted connections for the user
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (error) throw error;
      
      // Calculate total connections
      const totalConnections = data?.length || 0;
      
      // Calculate connections added this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const connectionsThisMonth = data?.filter(
        conn => new Date(conn.created_at) >= firstDayOfMonth
      ).length || 0;
      
      return { 
        total: totalConnections,
        thisMonth: connectionsThisMonth
      };
    },
    enabled: !!user
  });

  // Rest of the component remains the same
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <ProfileHeader isCurrentUser={isCurrentUser} connectionsData={connectionsData} />
            <AboutSection />
            <FeaturedSection />
            <ExperienceSection />
            <EducationSection />
            <ProjectsSection />
            
            {/* User's Posts */}
            {userPosts && userPosts.length > 0 && (
              <div className="hilite-card">
                <h2 className="text-xl font-bold p-4">Activity</h2>
                <div className="divide-y">
                  {userPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <UserClubs />
          </div>
        </div>
      </main>
    </div>
  );
}
