import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Club } from "@/types/club";
import PostCard from "@/components/post/PostCard";
import ClubChatPanel from "@/components/clubs/ClubChatPanel";
import ClubMembers from "@/components/clubs/ClubMembers";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Users, MessageSquare, Lock, Unlock, Settings, Calendar } from "lucide-react";

export default function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeTab, setActiveTab] = useState<"feed" | "chat" | "members">("feed");
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Fetch club data
  const { data: club, isLoading: isClubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      if (!clubId) return null;
      
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          *,
          club_members(user_id, role)
        `)
        .eq('id', clubId)
        .single();
        
      if (error) {
        console.error("Error fetching club:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!clubId
  });
  
  // Fetch club posts
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['club-posts', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id(name, role, avatar_url)
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching club posts:", error);
        return [];
      }
      
      // Get post likes and comments
      const postIds = postsData.map(post => post.id);
      
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);
        
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);
      
      // Format posts
      return postsData.map(post => {
        const likesCount = likesData ? likesData.filter(like => like.post_id === post.id).length : 0;
        const commentsCount = commentsData ? commentsData.filter(comment => comment.post_id === post.id).length : 0;
        const isLiked = user ? likesData?.some(like => like.post_id === post.id && like.user_id === user.id) : false;
        
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
          comments: commentsCount,
          timeAgo: formatTimeAgo(new Date(post.created_at)),
          isLiked
        };
      });
    },
    enabled: !!clubId
  });
  
  // Check membership status
  const { data: membershipData } = useQuery({
    queryKey: ['club-membership', clubId, user?.id],
    queryFn: async () => {
      if (!clubId || !user) return null;
      
      const { data, error } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error checking membership:", error);
      }
      
      return data;
    },
    enabled: !!clubId && !!user
  });
  
  // Join club mutation
  const joinClubMutation = useMutation({
    mutationFn: async () => {
      if (!user || !clubId) throw new Error("User not authenticated or club not found");
      
      const { error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: user.id,
          role: 'member'
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-membership', clubId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
      setIsMember(true);
      toast.success("You've joined the club!");
    },
    onError: (error: any) => {
      toast.error(`Failed to join club: ${error.message}`);
    }
  });
  
  // Leave club mutation
  const leaveClubMutation = useMutation({
    mutationFn: async () => {
      if (!user || !clubId) throw new Error("User not authenticated or club not found");
      
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-membership', clubId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
      setIsMember(false);
      setIsOwner(false);
      setIsAdmin(false);
      toast.success("You've left the club");
    },
    onError: (error: any) => {
      toast.error(`Failed to leave club: ${error.message}`);
    }
  });
  
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
  
  // Update membership status when data changes
  useEffect(() => {
    if (membershipData) {
      setIsMember(true);
      setIsOwner(membershipData.role === 'owner');
      setIsAdmin(membershipData.role === 'admin');
    } else {
      setIsMember(false);
      setIsOwner(false);
      setIsAdmin(false);
    }
  }, [membershipData]);
  
  // Format club data for display
  const formattedClub: Club | null = club ? {
    id: club.id,
    name: club.name,
    description: club.description || "",
    imageUrl: club.image_url,
    coverImageUrl: club.cover_image_url,
    isPrivate: club.is_private || false,
    createdAt: club.created_at,
    memberCount: club.member_count || 0,
    owner: {
      id: club.owner_id || "unknown",
      name: "Club Owner",
      avatarUrl: null
    },
    tags: club.tags || []
  } : null;
  
  if (isClubLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-40 bg-muted rounded-lg"></div>
              <div className="h-20 bg-muted rounded-lg"></div>
              <div className="h-40 bg-muted rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!formattedClub) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Club not found</h1>
            <p className="text-muted-foreground mb-4">The club you're looking for doesn't exist or has been removed.</p>
            <Link to="/clubs" className="hilite-btn-primary">
              Back to Clubs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative">
          {/* Cover image */}
          <div className="h-40 md:h-56 w-full bg-hilite-gray overflow-hidden">
            {formattedClub.coverImageUrl && (
              <img 
                src={formattedClub.coverImageUrl} 
                alt={formattedClub.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Club info section */}
          <div className="container relative -mt-16">
            <div className="hilite-card">
              <div className="flex flex-col md:flex-row md:items-end p-4 pt-16 md:pt-4">
                <div className="absolute -top-14 left-4 md:relative md:top-0 md:left-0 h-24 w-24 rounded-lg overflow-hidden border-4 border-background">
                  {formattedClub.imageUrl ? (
                    <img src={formattedClub.imageUrl} alt={formattedClub.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-hilite-purple flex items-center justify-center text-white text-2xl font-bold">
                      {formattedClub.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="md:ml-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl md:text-2xl font-bold">{formattedClub.name}</h1>
                    {formattedClub.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">{formattedClub.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formattedClub.tags?.map(tag => (
                      <span key={tag} className="text-xs bg-accent px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-2">
                  {isMember ? (
                    <>
                      <button 
                        className="hilite-btn-secondary text-sm"
                        onClick={() => leaveClubMutation.mutate()}
                        disabled={leaveClubMutation.isPending || isOwner}
                      >
                        {isOwner ? "Owner" : "Leave Club"}
                      </button>
                      {(isOwner || isAdmin) && (
                        <Link to={`/clubs/${formattedClub.id}/settings`} className="hilite-btn-secondary text-sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Link>
                      )}
                    </>
                  ) : (
                    <button 
                      className="hilite-btn-primary text-sm"
                      onClick={() => joinClubMutation.mutate()}
                      disabled={joinClubMutation.isPending}
                    >
                      {joinClubMutation.isPending ? "Joining..." : "Join Club"}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex border-t border-border">
                <button 
                  className={`flex-1 py-3 px-2 flex justify-center items-center space-x-1 
                    ${activeTab === "feed" ? "border-b-2 border-hilite-purple text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("feed")}
                >
                  Feed
                </button>
                <button 
                  className={`flex-1 py-3 px-2 flex justify-center items-center space-x-1 
                    ${activeTab === "chat" ? "border-b-2 border-hilite-purple text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Chat</span>
                </button>
                <button 
                  className={`flex-1 py-3 px-2 flex justify-center items-center space-x-1 
                    ${activeTab === "members" ? "border-b-2 border-hilite-purple text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("members")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <span>Members ({formattedClub.memberCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block">
              <div className="hilite-card mb-4">
                <div className="p-4 border-b border-border">
                  <h3 className="text-lg font-bold">About</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-bold">{formattedClub.memberCount} members</div>
                      <div className="text-xs text-muted-foreground">Including your connections</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-bold">Created on</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(formattedClub.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    {formattedClub.isPrivate ? (
                      <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    ) : (
                      <Unlock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{formattedClub.isPrivate ? "Private Club" : "Public Club"}</div>
                      <div className="text-xs text-muted-foreground">
                        {formattedClub.isPrivate 
                          ? "Only members can see content" 
                          : "Anyone can view content"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === "feed" && (
                <>
                  {isMember && <CreatePostForm clubId={formattedClub.id} />}
                  
                  {isPostsLoading ? (
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
                  ) : posts.length > 0 ? (
                    posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="hilite-card p-8 text-center">
                      <h3 className="text-lg font-bold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {isMember 
                          ? "Be the first to share something with the club!" 
                          : "Join the club to see and create posts"}
                      </p>
                      {!isMember && (
                        <button 
                          className="hilite-btn-primary"
                          onClick={() => joinClubMutation.mutate()}
                          disabled={joinClubMutation.isPending}
                        >
                          {joinClubMutation.isPending ? "Joining..." : "Join Club"}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {activeTab === "chat" && (
                isMember ? (
                  <ClubChatPanel clubId={formattedClub.id} />
                ) : (
                  <div className="hilite-card p-8 text-center">
                    <h3 className="text-lg font-bold mb-2">Members Only</h3>
                    <p className="text-muted-foreground mb-4">
                      Join the club to participate in the chat
                    </p>
                    <button 
                      className="hilite-btn-primary"
                      onClick={() => joinClubMutation.mutate()}
                      disabled={joinClubMutation.isPending}
                    >
                      {joinClubMutation.isPending ? "Joining..." : "Join Club"}
                    </button>
                  </div>
                )
              )}
              
              {activeTab === "members" && <ClubMembers clubId={formattedClub.id} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}