
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Folder, Plus } from "lucide-react";

interface UserClubsProps {
  userId: string;
  isCurrentUser?: boolean;
}

export default function UserClubs({ userId, isCurrentUser = false }: UserClubsProps) {
  // Fetch user's clubs
  const { data: userClubs, isLoading } = useQuery({
    queryKey: ['userClubs', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // This is a placeholder query - in a real app, you would have a table
      // linking users to clubs they're members of
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .limit(5);
        
      if (error) {
        console.error("Error fetching clubs:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  return (
    <div className="hilite-card">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-hilite-purple" />
          <h2 className="text-lg font-bold">Clubs</h2>
        </div>
        
        <Link to="/clubs" className="text-hilite-purple text-sm hover:underline">
          <Plus className="h-4 w-4 inline mr-1" />
          {isCurrentUser ? "Join Clubs" : "View Clubs"}
        </Link>
      </div>
      
      <div>
        {isLoading ? (
          <div className="p-4 space-y-2">
            <div className="h-12 bg-muted animate-pulse rounded-md"></div>
            <div className="h-12 bg-muted animate-pulse rounded-md"></div>
          </div>
        ) : userClubs && userClubs.length > 0 ? (
          userClubs.map(club => (
            <Link 
              key={club.id}
              to={`/club/${club.id}`} 
              className="flex items-center p-4 hover:bg-accent border-b border-border last:border-b-0"
            >
              <div className="h-10 w-10 rounded-lg bg-hilite-gray overflow-hidden mr-3">
                {club.image_url ? (
                  <img src={club.image_url} alt={club.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-hilite-purple flex items-center justify-center text-white font-bold">
                    {club.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-bold text-sm">{club.name}</div>
                <div className="text-xs text-muted-foreground">
                  {club.member_count || 0} members
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-3">Not a member of any clubs yet</p>
            <Link to="/clubs" className="hilite-btn-primary inline-flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Browse Clubs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
