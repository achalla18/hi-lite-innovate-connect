
import { Link } from "react-router-dom";
import { MapPin, Briefcase, GraduationCap, Volume2, Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  isCurrentUser?: boolean;
  connectionsData?: {
    total: number;
    thisMonth: number;
  };
  profile?: any; // The profile being viewed
  onEditProfile?: () => void;
}

export default function ProfileHeader({ 
  isCurrentUser = false, 
  connectionsData, 
  profile, 
  onEditProfile 
}: ProfileHeaderProps) {
  const { user, profile: currentUserProfile } = useAuth();
  
  // Use the provided profile or fall back to the current user's profile
  const displayProfile = profile || currentUserProfile;
  
  const { data: education } = useQuery({
    queryKey: ['profileEducation', profile?.id || user?.id],
    queryFn: async () => {
      if (!displayProfile?.id) return null;
      
      // In a real app, this would fetch from an education table
      return null;
    },
    enabled: !!displayProfile?.id
  });
  
  const { data: work } = useQuery({
    queryKey: ['profileWork', profile?.id || user?.id],
    queryFn: async () => {
      if (!displayProfile?.id) return null;
      
      // In a real app, this would fetch from a work experience table
      return null;
    },
    enabled: !!displayProfile?.id
  });

  return (
    <div className="hilite-card mb-4">
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 md:h-48 rounded-t-lg bg-gradient-to-r from-hilite-dark-red to-hilite-light-blue"></div>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-4 md:left-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage 
                src={displayProfile?.avatar_url || "/placeholder.svg"} 
                alt={displayProfile?.name || "Profile"} 
              />
              <AvatarFallback className="text-xl">
                {displayProfile?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Action buttons */}
        {isCurrentUser ? (
          <div className="absolute top-4 right-4 space-x-2">
            <Button onClick={onEditProfile} className="hilite-btn-secondary text-sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        ) : null}
      </div>

      {/* Profile Info */}
      <div className="mt-14 md:mt-16 px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">{displayProfile?.name || "Complete Your Profile"}</h1>
          <button className="text-muted-foreground hover:text-foreground">
            <Volume2 className="h-4 w-4" />
          </button>
          {displayProfile?.role && (
            <div className="px-2 py-1 text-xs bg-hilite-light-blue text-hilite-dark-red rounded-full">
              Open to Work
            </div>
          )}
        </div>

        <h2 className="text-lg text-muted-foreground">{displayProfile?.role || "Add your professional headline"}</h2>
        
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          {displayProfile?.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{displayProfile.location}</span>
            </div>
          )}
          
          {work && (
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              <Link to={`/company/${work.companyId}`} className="hover:text-hilite-dark-red">
                {work.companyName}
              </Link>
            </div>
          )}
          
          {education && (
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-1" />
              <Link to={`/school/${education.schoolId}`} className="hover:text-hilite-dark-red">
                {education.schoolName}
              </Link>
              {education.isCurrentlyAttending && (
                <span className="ml-2 px-2 py-0.5 bg-accent rounded-full text-xs font-mono">
                  Currently Attending
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex mt-4 space-x-4 text-sm">
          <div>
            <span className="font-bold">{connectionsData?.total || 0}</span> connections
          </div>
          <div>
            <span className="font-bold">{connectionsData?.thisMonth || 0}</span> added this month
          </div>
        </div>
      </div>
    </div>
  );
}
