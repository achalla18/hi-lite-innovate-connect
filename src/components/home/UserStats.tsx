
import { useEffect, useState } from "react";
import { BarChartIcon, Users, Eye, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface UserStatsProps {
  hideIfNotAvailable?: boolean;
}

export default function UserStats({ hideIfNotAvailable = false }: UserStatsProps) {
  const { user } = useAuth();
  
  const fetchConnections = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
      .eq('status', 'accepted');
      
    if (error) throw error;
    return data || [];
  };
  
  const fetchProfileViews = async () => {
    if (!user) return null;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('profile_views')
      .select('*')
      .eq('profile_id', user.id)
      .gte('viewed_at', thirtyDaysAgo.toISOString());
      
    if (error) throw error;
    return data || [];
  };
  
  const fetchSearchAppearances = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('search_appearances')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) throw error;
    return data || [];
  };

  const { 
    data: connections, 
    isLoading: isLoadingConnections 
  } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: fetchConnections,
    enabled: !!user
  });
  
  const { 
    data: profileViews, 
    isLoading: isLoadingProfileViews 
  } = useQuery({
    queryKey: ['profileViews', user?.id],
    queryFn: fetchProfileViews,
    enabled: !!user
  });
  
  const { 
    data: searchAppearances, 
    isLoading: isLoadingSearchAppearances 
  } = useQuery({
    queryKey: ['searchAppearances', user?.id],
    queryFn: fetchSearchAppearances,
    enabled: !!user
  });
  
  const isLoading = isLoadingConnections || isLoadingProfileViews || isLoadingSearchAppearances;
  
  // Show monthly growth stats (% or count)
  const [connectionGrowth, setConnectionGrowth] = useState<number>(0);
  const [profileViewsGrowth, setProfileViewsGrowth] = useState<number>(0);
  
  useEffect(() => {
    // Calculate connections growth
    if (connections && connections.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newConnections = connections.filter(conn => 
        new Date(conn.created_at) > thirtyDaysAgo
      ).length;
      
      setConnectionGrowth(newConnections);
    }
    
    // Calculate profile views growth
    if (profileViews && profileViews.length > 0) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentViews = profileViews.filter(view => 
        new Date(view.viewed_at) > sevenDaysAgo
      ).length;
      
      const totalViews = profileViews.length;
      const weeklyPercentage = totalViews > 0 
        ? Math.round((recentViews / totalViews) * 100) 
        : 0;
      
      setProfileViewsGrowth(weeklyPercentage);
    }
  }, [connections, profileViews]);
  
  if (isLoading) {
    return (
      <div className="hilite-card mb-4 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-hilite-gray rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-hilite-gray rounded"></div>
            <div className="h-10 bg-hilite-gray rounded"></div>
            <div className="h-10 bg-hilite-gray rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const hasData = (connections && connections.length > 0) || 
                 (profileViews && profileViews.length > 0) || 
                 (searchAppearances && searchAppearances.length > 0);
                 
  if (hideIfNotAvailable && !hasData) {
    return null;
  }

  return (
    <div className="hilite-card mb-4">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <BarChartIcon className="h-5 w-5 text-hilite-purple" />
            <h2 className="text-lg font-bold">Your Network Stats</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Insights visible to only you
          </p>
        </div>
      </div>
      
      <div className="space-y-1">
        <Link 
          to="/connections" 
          className="flex justify-between items-center p-4 hover:bg-accent rounded-none transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-mono text-sm">Connections</div>
              <div className="font-bold">{connections?.length || 0}</div>
            </div>
          </div>
          <div className="text-sm text-hilite-purple flex items-center">
            {connectionGrowth > 0 && <span>+{connectionGrowth} this month</span>}
            {connectionGrowth === 0 && <span>Start connecting</span>}
          </div>
        </Link>
        
        <Link
          to="/profile/analytics" 
          className="flex justify-between items-center p-4 hover:bg-accent rounded-none transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-mono text-sm">Who viewed your profile</div>
              <div className="font-bold">{profileViews?.length || 0}</div>
            </div>
          </div>
          <div className="text-sm text-hilite-purple flex items-center">
            {profileViewsGrowth > 0 && <span>+{profileViewsGrowth}% this week</span>}
            {profileViewsGrowth === 0 && <span>Complete your profile</span>}
          </div>
        </Link>
        
        <Link
          to="/search-appearances" 
          className="flex justify-between items-center p-4 hover:bg-accent rounded-none border-t border-border transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-mono text-sm">Search appearances</div>
              <div className="font-bold">{searchAppearances?.length || 0}</div>
            </div>
          </div>
          <div className="text-sm text-hilite-purple flex items-center">
            <span>Grow your network</span>
          </div>
        </Link>
      </div>
      
      <div className="p-4 border-t border-border">
        <Link to="/premium" className="text-sm text-hilite-purple hover:underline">
          Get more insights with Hi-Lite Premium →
        </Link>
      </div>
    </div>
  );
}
