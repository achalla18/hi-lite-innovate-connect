
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import SavedPosts from "@/components/profile/SavedPosts";
import UserClubs from "@/components/profile/UserClubs";
import AdminPanel from "@/components/admin/AdminPanel";
import UserPosts from "@/components/profile/UserPosts";
import ConnectionButton from "@/components/profile/ConnectionButton";
import ProfileStats from "@/components/profile/ProfileStats";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import EditProfileForm from "@/components/profile/EditProfileForm";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
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

  // Fetch connections data 
  const connectionsData = ProfileStats({ userId: userId || "" });

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
              onEditProfile={() => setIsEditProfileOpen(true)}
            />
            
            <ConnectionButton 
              userId={userId || ""} 
              isCurrentUser={isCurrentUser} 
            />
            
            <AboutSection 
              isCurrentUser={isCurrentUser} 
              initialBio={viewedProfile?.about || ""}
            />
            
            <FeaturedSection isCurrentUser={isCurrentUser} />
            
            <ExperienceSection 
              userId={userId || ""} 
              isCurrentUser={isCurrentUser} 
            />
            
            <EducationSection 
              userId={userId || ""} 
              isCurrentUser={isCurrentUser} 
            />
            
            <ProjectsSection isCurrentUser={isCurrentUser} />
            
            {/* User's Posts */}
            <UserPosts userId={userId || ""} profileData={profileData} />
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
            
            <UserClubs userId={userId || ""} isCurrentUser={isCurrentUser} />
          </div>
        </div>
      </main>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
          </DialogHeader>
          <EditProfileForm onComplete={() => setIsEditProfileOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
