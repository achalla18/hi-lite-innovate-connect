
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ConnectionButtonProps {
  userId: string;
  isCurrentUser: boolean;
}

export default function ConnectionButton({ userId, isCurrentUser }: ConnectionButtonProps) {
  const { user } = useAuth();
  
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

  if (isCurrentUser) {
    return null;
  }

  return (
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
  );
}
