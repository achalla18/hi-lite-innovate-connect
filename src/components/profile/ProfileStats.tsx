
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileStatsProps {
  userId: string;
}

export default function ProfileStats({ userId }: ProfileStatsProps) {
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

  return connectionsData;
}
