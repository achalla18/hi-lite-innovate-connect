
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare, UserCheck, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ConnectionButtonProps {
  userId: string;
  isCurrentUser: boolean;
}

export default function ConnectionButton({ userId, isCurrentUser }: ConnectionButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Check if the current user is connected with the viewed profile
  const { data: connectionStatus, isLoading } = useQuery({
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

  // Send connection request mutation
  const sendConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: userId,
          status: 'pending'
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionStatus', user?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
      toast.success("Connection request sent!");
    },
    onError: (error: any) => {
      toast.error(`Failed to send connection request: ${error.message}`);
    }
  });

  // Accept connection request mutation
  const acceptConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!connectionStatus?.id) throw new Error("Connection not found");
      
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionStatus.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionStatus', user?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
      toast.success("Connection accepted!");
    },
    onError: (error: any) => {
      toast.error(`Failed to accept connection: ${error.message}`);
    }
  });

  // Reject connection request mutation
  const rejectConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!connectionStatus?.id) throw new Error("Connection not found");
      
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionStatus.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionStatus', user?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', user?.id] });
      toast.success("Connection request rejected");
    },
    onError: (error: any) => {
      toast.error(`Failed to reject connection request: ${error.message}`);
    }
  });

  if (isCurrentUser || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 mb-4">
        <Button disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-4">
      {!connectionStatus ? (
        <Button 
          onClick={() => sendConnectionMutation.mutate()}
          className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
          disabled={sendConnectionMutation.isPending}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {sendConnectionMutation.isPending ? "Sending..." : "Connect"}
        </Button>
      ) : connectionStatus.status === 'pending' ? (
        connectionStatus.user_id === user.id ? (
          <Button variant="outline" disabled>
            Request Pending
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={() => acceptConnectionMutation.mutate()}
              className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
              disabled={acceptConnectionMutation.isPending}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {acceptConnectionMutation.isPending ? "Accepting..." : "Accept"}
            </Button>
            <Button 
              variant="outline"
              onClick={() => rejectConnectionMutation.mutate()}
              disabled={rejectConnectionMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              {rejectConnectionMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        )
      ) : connectionStatus.status === 'accepted' ? (
        <Button variant="outline" className="border-hilite-dark-red text-hilite-dark-red">
          <UserCheck className="h-4 w-4 mr-2" />
          Connected
        </Button>
      ) : null}
      <Button variant="outline">
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
    </div>
  );
}
