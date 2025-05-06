
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Connection {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  mutualConnections: number;
}

export default function NetworkSuggestions() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedConnections, setSuggestedConnections] = useState<Connection[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSuggestedConnections = async () => {
      setIsLoading(true);
      
      try {
        // Get current connections to exclude them
        const { data: existingConnections } = await supabase
          .from('connections')
          .select('connected_user_id, user_id')
          .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
          .eq('status', 'accepted');
          
        const connectedUserIds = new Set<string>();
        
        if (existingConnections) {
          existingConnections.forEach(conn => {
            if (conn.user_id === user.id) {
              connectedUserIds.add(conn.connected_user_id);
            } else {
              connectedUserIds.add(conn.user_id);
            }
          });
        }
        
        // Also exclude pending connections
        const { data: pendingConnections } = await supabase
          .from('connections')
          .select('connected_user_id, user_id')
          .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
          .eq('status', 'pending');
          
        if (pendingConnections) {
          pendingConnections.forEach(conn => {
            if (conn.user_id === user.id) {
              connectedUserIds.add(conn.connected_user_id);
            } else {
              connectedUserIds.add(conn.user_id);
            }
          });
        }
        
        // Add current user to excluded list
        connectedUserIds.add(user.id);
        
        // Get profiles that aren't connected yet
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${Array.from(connectedUserIds).join(',')})`)
          .limit(3);
        
        if (profiles) {
          // For each profile, determine mutual connections
          const suggestions = await Promise.all(profiles.map(async (profile) => {
            // This would be more complex in a real app to find actual mutual connections
            const mutualCount = Math.floor(Math.random() * 15); // Mock data
            
            return {
              id: profile.id,
              name: profile.name || 'Anonymous User',
              role: profile.role || 'Hi-Lite Member',
              avatarUrl: profile.avatar_url || undefined,
              mutualConnections: mutualCount
            };
          }));
          
          setSuggestedConnections(suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestedConnections();
  }, [user]);

  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: userId,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent."
      });
      
      // Remove the user from suggestions
      setSuggestedConnections(prev => 
        prev.filter(connection => connection.id !== userId)
      );
      
      // Refresh connection data
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="hilite-card">
        <h2 className="text-lg font-bold mb-4">People you may know</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-hilite-gray"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-hilite-gray rounded w-3/4"></div>
                <div className="h-3 bg-hilite-gray rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-hilite-gray rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hilite-card">
      <h2 className="text-lg font-bold mb-4">People you may know</h2>
      {suggestedConnections.length > 0 ? (
        <div className="space-y-4">
          {suggestedConnections.map((person) => (
            <div key={person.id} className="flex items-start space-x-3">
              <Link to={`/profile/${person.id}`} className="h-10 w-10 rounded-full bg-hilite-gray overflow-hidden flex-shrink-0">
                <img
                  src={person.avatarUrl || "https://via.placeholder.com/40"}
                  alt={person.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${person.id}`} className="font-bold hover:text-hilite-purple truncate block">
                  {person.name}
                </Link>
                <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{person.mutualConnections} mutual connections</p>
              </div>
              
              <button 
                onClick={() => sendConnectionRequest(person.id)}
                className="hilite-btn-secondary text-xs flex items-center flex-shrink-0"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Connect
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No suggestions available right now</p>
        </div>
      )}
      
      <Link to="/network" className="hilite-link block text-center text-sm mt-4">
        View more
      </Link>
    </div>
  );
}
