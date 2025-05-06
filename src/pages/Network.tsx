
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Users, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Network() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("connections");

  // Fetch all user connections
  const { data: connections, isLoading: isLoadingConnections, refetch: refetchConnections } = useQuery({
    queryKey: ['network-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all connections for the user (as requester or receiver)
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          user_id,
          connected_user_id,
          created_at
        `)
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (error) throw error;
      
      // Get user IDs from connections
      const connectionUserIds = data?.map(conn => 
        conn.user_id === user.id ? conn.connected_user_id : conn.user_id
      ) || [];
      
      if (connectionUserIds.length === 0) return [];
      
      // Get profile data for all connection users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', connectionUserIds);
        
      if (profilesError) throw profilesError;
      
      // Combine connection and profile data
      return data.map(conn => {
        const connectedUserId = conn.user_id === user.id ? conn.connected_user_id : conn.user_id;
        const profileData = profilesData?.find(profile => profile.id === connectedUserId);
        
        return {
          id: conn.id,
          userId: connectedUserId,
          name: profileData?.name || 'User',
          role: profileData?.role || '',
          avatarUrl: profileData?.avatar_url || '/placeholder.svg',
          status: conn.status,
          connectionDate: new Date(conn.created_at)
        };
      });
    },
    enabled: !!user
  });

  // Fetch pending connection requests
  const { data: pendingRequests, isLoading: isLoadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['network-pending', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get pending requests where current user is the receiver
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          user_id,
          connected_user_id,
          created_at
        `)
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      // Get user IDs of requesters
      const requesterIds = data?.map(conn => conn.user_id) || [];
      
      if (requesterIds.length === 0) return [];
      
      // Get profile data for requesters
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', requesterIds);
        
      if (profilesError) throw profilesError;
      
      // Combine request and profile data
      return data.map(conn => {
        const profileData = profilesData?.find(profile => profile.id === conn.user_id);
        
        return {
          id: conn.id,
          userId: conn.user_id,
          name: profileData?.name || 'User',
          role: profileData?.role || '',
          avatarUrl: profileData?.avatar_url || '/placeholder.svg',
          requestDate: new Date(conn.created_at)
        };
      });
    },
    enabled: !!user
  });

  // Fetch sent connection requests
  const { data: sentRequests, isLoading: isLoadingSent, refetch: refetchSent } = useQuery({
    queryKey: ['network-sent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get pending requests initiated by the current user
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          user_id,
          connected_user_id,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      // Get user IDs of receivers
      const receiverIds = data?.map(conn => conn.connected_user_id) || [];
      
      if (receiverIds.length === 0) return [];
      
      // Get profile data for receivers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', receiverIds);
        
      if (profilesError) throw profilesError;
      
      // Combine request and profile data
      return data.map(conn => {
        const profileData = profilesData?.find(profile => profile.id === conn.connected_user_id);
        
        return {
          id: conn.id,
          userId: conn.connected_user_id,
          name: profileData?.name || 'User',
          role: profileData?.role || '',
          avatarUrl: profileData?.avatar_url || '/placeholder.svg',
          requestDate: new Date(conn.created_at)
        };
      });
    },
    enabled: !!user
  });

  // Get user suggestions
  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['network-suggestions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get current connections (to exclude them from suggestions)
      const { data: currentConnections, error: connectionsError } = await supabase
        .from('connections')
        .select('user_id, connected_user_id')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);
        
      if (connectionsError) throw connectionsError;
      
      // Get connected user IDs
      const connectedUserIds = currentConnections?.map(conn => 
        conn.user_id === user.id ? conn.connected_user_id : conn.user_id
      ) || [];
      
      // Get profiles that are not already connected or the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', [...connectedUserIds, user.id])
        .limit(10);
        
      if (error) throw error;
      
      return data?.map(profile => ({
        id: profile.id,
        name: profile.name || 'User',
        role: profile.role || '',
        avatarUrl: profile.avatar_url || '/placeholder.svg'
      })) || [];
    },
    enabled: !!user
  });

  // Handle accepting a connection request
  const acceptRequest = async (requestId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', requestId);
      
    if (error) {
      toast.error('Failed to accept connection');
      return;
    }
    
    toast.success('Connection accepted');
    refetchPending();
    refetchConnections();
  };

  // Handle rejecting a connection request
  const rejectRequest = async (requestId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', requestId);
      
    if (error) {
      toast.error('Failed to reject connection');
      return;
    }
    
    toast.success('Connection rejected');
    refetchPending();
  };

  // Handle canceling a sent request
  const cancelRequest = async (requestId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', requestId);
      
    if (error) {
      toast.error('Failed to cancel request');
      return;
    }
    
    toast.success('Request canceled');
    refetchSent();
  };

  // Handle sending a new connection request
  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('connections')
      .insert({
        user_id: user.id,
        connected_user_id: userId,
        status: 'pending'
      });
      
    if (error) {
      toast.error('Failed to send connection request');
      return;
    }
    
    toast.success('Connection request sent');
    refetchSuggestions();
    refetchSent();
  };

  // Format date to a readable format
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">My Network</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Tabs defaultValue="connections" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="connections" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Connections
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending ({pendingRequests?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sent ({sentRequests?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="connections">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Connections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingConnections ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center justify-between p-3 border-b animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-hilite-gray rounded-full" />
                              <div className="space-y-1">
                                <div className="h-4 bg-hilite-gray rounded w-24" />
                                <div className="h-3 bg-hilite-gray rounded w-32" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : connections?.length ? (
                      <div className="divide-y">
                        {connections.map(connection => (
                          <div key={connection.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center space-x-3">
                              <Link to={`/profile/${connection.userId}`}>
                                <Avatar>
                                  <AvatarImage src={connection.avatarUrl} alt={connection.name} />
                                  <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                              <div>
                                <Link to={`/profile/${connection.userId}`} className="font-medium hover:underline">
                                  {connection.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">{connection.role}</p>
                                <p className="text-xs text-muted-foreground">
                                  Connected since {formatDate(connection.connectionDate)}
                                </p>
                              </div>
                            </div>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm">Message</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-1">No connections yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start building your professional network
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPending ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="flex items-center justify-between p-3 border-b animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-hilite-gray rounded-full" />
                              <div className="space-y-1">
                                <div className="h-4 bg-hilite-gray rounded w-24" />
                                <div className="h-3 bg-hilite-gray rounded w-32" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : pendingRequests?.length ? (
                      <div className="divide-y">
                        {pendingRequests.map(request => (
                          <div key={request.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center space-x-3">
                              <Link to={`/profile/${request.userId}`}>
                                <Avatar>
                                  <AvatarImage src={request.avatarUrl} alt={request.name} />
                                  <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                              <div>
                                <Link to={`/profile/${request.userId}`} className="font-medium hover:underline">
                                  {request.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">{request.role}</p>
                                <p className="text-xs text-muted-foreground">
                                  Requested {formatDate(request.requestDate)}
                                </p>
                              </div>
                            </div>
                            <div className="space-x-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => acceptRequest(request.id)}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => rejectRequest(request.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-1">No pending requests</h3>
                        <p className="text-muted-foreground">
                          When someone wants to connect with you, you'll see them here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sent">
                <Card>
                  <CardHeader>
                    <CardTitle>Sent Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSent ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="flex items-center justify-between p-3 border-b animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-hilite-gray rounded-full" />
                              <div className="space-y-1">
                                <div className="h-4 bg-hilite-gray rounded w-24" />
                                <div className="h-3 bg-hilite-gray rounded w-32" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : sentRequests?.length ? (
                      <div className="divide-y">
                        {sentRequests.map(request => (
                          <div key={request.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center space-x-3">
                              <Link to={`/profile/${request.userId}`}>
                                <Avatar>
                                  <AvatarImage src={request.avatarUrl} alt={request.name} />
                                  <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                              <div>
                                <Link to={`/profile/${request.userId}`} className="font-medium hover:underline">
                                  {request.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">{request.role}</p>
                                <p className="text-xs text-muted-foreground">
                                  Sent {formatDate(request.requestDate)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => cancelRequest(request.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-1">No sent requests</h3>
                        <p className="text-muted-foreground">
                          When you send connection requests, they'll appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>People You May Know</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSuggestions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-3 border-b animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-hilite-gray rounded-full" />
                          <div className="space-y-1">
                            <div className="h-4 bg-hilite-gray rounded w-24" />
                            <div className="h-3 bg-hilite-gray rounded w-32" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions?.length ? (
                  <div className="divide-y">
                    {suggestions.map(suggestion => (
                      <div key={suggestion.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                          <Link to={`/profile/${suggestion.id}`}>
                            <Avatar>
                              <AvatarImage src={suggestion.avatarUrl} alt={suggestion.name} />
                              <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link to={`/profile/${suggestion.id}`} className="font-medium hover:underline">
                              {suggestion.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{suggestion.role}</p>
                          </div>
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sendConnectionRequest(suggestion.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-1">No suggestions</h3>
                    <p className="text-muted-foreground">
                      We'll suggest people you might know as more users join
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
