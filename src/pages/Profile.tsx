import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import FeaturedSection from "@/components/profile/FeaturedSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import SavedPosts from "@/components/profile/SavedPosts";
import PostCard from "@/components/post/PostCard";
import UserClubs from "@/components/profile/UserClubs";
import AdminPanel from "@/components/admin/AdminPanel";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare } from "lucide-react";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  useEffect(() => {
    // If no userId is provided, use the current user's profile
    if (!userId && user) {
      navigate(`/profile/${user.id}`, { replace: true });
    }
    
    // Determine if the profile being viewed is the current user's profile
    setIsCurrentUser(userId === user?.id);
    
  }, [userId, user, navigate]);

  // Fetch the profile data for the user being viewed
  const { data: viewedProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Set profile data when viewedProfile changes
  useEffect(() => {
    if (viewedProfile) {
      setProfileData(viewedProfile);
      
      // Record profile view if not viewing own profile
      if (!isCurrentUser && user) {
        recordProfileView();
      }
    }
  }, [viewedProfile, isCurrentUser, user]);

  // Record that the current user viewed this profile
  const recordProfileView = async () => {
    if (!user || !userId || userId === user.id) return;
    
    try {
      await supabase.from('profile_views').insert({
        profile_id: userId,
        viewer_id: user.id
      });
    } catch (error) {
      console.error("Error recording profile view:", error);
    }
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

  // Get connections count
  const { data: connectionsData } = useQuery({
    queryKey: ['connections', userId],
    queryFn: async () => {
      if (!userId) return { total: 0, thisMonth: 0 };
      
      // Get all accepted connections for the user
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
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
    enabled: !!userId
  });

  // Check if the current user is connected with the viewed profile
  const { data: connectionStatus } = useQuery({
    queryKey: ['connectionStatus', user?.id, userId],
    queryFn: async () => {
      if (!user || !userId || isCurrentUser) return null;
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id.eq.${user.id},connected_user_id.eq.${userId}),and(user_id.eq.${userId},connected_user_id.eq.${user.id})`)
        .maybeSingle();
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!user && !!userId && !isCurrentUser
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

  const handleSendConnectionRequest = async () => {
    if (!user || !userId) return;
    
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: userId,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast.success("Connection request sent!");
    } catch (error: any) {
      toast.error(`Failed to send connection request: ${error.message}`);
    }
  };
  
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

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-40 bg-muted rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <ProfileHeader 
              isCurrentUser={isCurrentUser} 
              connectionsData={connectionsData}
              profile={viewedProfile}
            />
            
            {!isCurrentUser && (
              <div className="flex gap-2 mb-4">
                {!connectionStatus ? (
                  <Button 
                    onClick={handleSendConnectionRequest}
                    className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                ) : connectionStatus.status === 'pending' ? (
                  <Button variant="outline" disabled>
                    Request Pending
                  </Button>
                ) : null}
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
            
            <AboutSection 
              isCurrentUser={isCurrentUser} 
              initialBio={viewedProfile?.about || ""}
            />
            <FeaturedSection />
            <ExperienceSection isCurrentUser={isCurrentUser} />
            <EducationSection isCurrentUser={isCurrentUser} />
            <ProjectsSection isCurrentUser={isCurrentUser} />
            
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
            {/* Show saved posts only for current user */}
            {isCurrentUser && (
              <SavedPosts />
            )}

            {/* Show admin panel for admins/mods */}
            {isCurrentUser && isModOrAdmin && (
              <AdminPanel />
            )}
            
            <UserClubs />
          </div>
        </div>
      </main>
    </div>
  );
}
