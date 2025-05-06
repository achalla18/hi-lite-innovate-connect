
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, Heart, MessageSquare, Eye } from "lucide-react";

type NotificationType = "connection" | "post_like" | "post_comment" | "profile_view";

interface Notification {
  id: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  targetId?: string;
  timestamp: Date;
  read: boolean;
  content?: string;
}

export default function Notifications() {
  const { user } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const result: Notification[] = [];
      
      // Get profile views with fixed join relationship
      const { data: viewsData } = await supabase
        .from('profile_views')
        .select(`
          id, 
          viewed_at,
          viewer_id,
          viewers:profiles(name, avatar_url)
        `)
        .eq('profile_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);
        
      if (viewsData) {
        const viewNotifications: Notification[] = viewsData
          .filter(view => view.viewer_id && view.viewer_id !== user.id && view.viewers)
          .map(view => ({
            id: view.id,
            type: "profile_view" as NotificationType,
            actorId: view.viewer_id || '',
            actorName: view.viewers?.name || 'Someone',
            actorAvatar: view.viewers?.avatar_url || '/placeholder.svg',
            timestamp: new Date(view.viewed_at),
            read: true,
          }));
        
        result.push(...viewNotifications);
      }
      
      // Get connection requests with fixed join relationship
      const { data: connectionsData } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          user_id,
          requesters:profiles(name, avatar_url)
        `)
        .eq('connected_user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (connectionsData) {
        const connectionNotifications: Notification[] = connectionsData.map(connection => ({
          id: connection.id,
          type: "connection" as NotificationType,
          actorId: connection.user_id,
          actorName: connection.requesters?.name || 'Someone',
          actorAvatar: connection.requesters?.avatar_url || '/placeholder.svg',
          timestamp: new Date(connection.created_at),
          read: true,
        }));
        
        result.push(...connectionNotifications);
      }
      
      // Get post likes
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id);
        
      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map(post => post.id);
        
        // Get post likes with fixed join relationship
        const { data: likesData } = await supabase
          .from('post_likes')
          .select(`
            id,
            created_at,
            post_id,
            user_id,
            likers:profiles(name, avatar_url)
          `)
          .in('post_id', postIds)
          .neq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (likesData) {
          const likeNotifications: Notification[] = likesData.map(like => ({
            id: like.id,
            type: "post_like" as NotificationType,
            actorId: like.user_id,
            actorName: like.likers?.name || 'Someone',
            actorAvatar: like.likers?.avatar_url || '/placeholder.svg',
            targetId: like.post_id,
            timestamp: new Date(like.created_at),
            read: true,
          }));
          
          result.push(...likeNotifications);
        }
        
        // Get post comments with fixed join relationship
        const { data: commentsData } = await supabase
          .from('post_comments')
          .select(`
            id,
            created_at,
            post_id,
            user_id,
            content,
            commenters:profiles(name, avatar_url)
          `)
          .in('post_id', postIds)
          .neq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (commentsData) {
          const commentNotifications: Notification[] = commentsData.map(comment => ({
            id: comment.id,
            type: "post_comment" as NotificationType,
            actorId: comment.user_id,
            actorName: comment.commenters?.name || 'Someone',
            actorAvatar: comment.commenters?.avatar_url || '/placeholder.svg',
            targetId: comment.post_id,
            timestamp: new Date(comment.created_at),
            content: comment.content,
            read: true,
          }));
          
          result.push(...commentNotifications);
        }
      }
      
      // Sort all notifications by timestamp (newest first)
      return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    enabled: !!user
  });

  // Helper function to render notification message
  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "connection":
        return "sent you a connection request";
      case "post_like":
        return "liked your post";
      case "post_comment":
        return "commented on your post";
      case "profile_view":
        return "viewed your profile";
      default:
        return "interacted with you";
    }
  };

  // Helper function to get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "connection":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "post_like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "post_comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "profile_view":
        return <Eye className="h-4 w-4 text-purple-500" />;
    }
  };

  // Filter notifications by type
  const connectionNotifications = notifications?.filter(n => n.type === "connection") || [];
  const postNotifications = notifications?.filter(n => n.type === "post_like" || n.type === "post_comment") || [];
  const viewNotifications = notifications?.filter(n => n.type === "profile_view") || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        
        <div className="max-w-3xl">
          <Tabs defaultValue="all">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="all" className="flex-1">
                All ({notifications?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex-1">
                Connections ({connectionNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1">
                Posts ({postNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="views" className="flex-1">
                Profile Views ({viewNotifications.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="hilite-card divide-y">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-hilite-gray rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-hilite-gray rounded w-4/5"></div>
                        <div className="h-3 bg-hilite-gray rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 flex items-start space-x-3 ${notification.read ? '' : 'bg-accent'}`}
                  >
                    <Link to={`/profile/${notification.actorId}`}>
                      <Avatar>
                        <AvatarImage src={notification.actorAvatar} alt={notification.actorName} />
                        <AvatarFallback>
                          {notification.actorName ? notification.actorName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1">
                      <p>
                        <Link 
                          to={`/profile/${notification.actorId}`}
                          className="font-medium hover:underline"
                        >
                          {notification.actorName}
                        </Link>
                        {" "}
                        {getNotificationMessage(notification)}
                        {notification.content && (
                          <span className="pl-1 text-muted-foreground italic">"{notification.content.length > 30 ? `${notification.content.substring(0, 30)}...` : notification.content}"</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                        {getNotificationIcon(notification.type)}
                        <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="connections" className="hilite-card divide-y">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-hilite-gray rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-hilite-gray rounded w-4/5"></div>
                        <div className="h-3 bg-hilite-gray rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : connectionNotifications.length > 0 ? (
                connectionNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 flex items-start space-x-3 ${notification.read ? '' : 'bg-accent'}`}
                  >
                    <Link to={`/profile/${notification.actorId}`}>
                      <Avatar>
                        <AvatarImage src={notification.actorAvatar} alt={notification.actorName} />
                        <AvatarFallback>
                          {notification.actorName ? notification.actorName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1">
                      <p>
                        <Link 
                          to={`/profile/${notification.actorId}`}
                          className="font-medium hover:underline"
                        >
                          {notification.actorName}
                        </Link>
                        {" "}
                        sent you a connection request
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                        <UserPlus className="h-4 w-4 text-blue-500" />
                        <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No connection notifications</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="posts" className="hilite-card divide-y">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-hilite-gray rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-hilite-gray rounded w-4/5"></div>
                        <div className="h-3 bg-hilite-gray rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : postNotifications.length > 0 ? (
                postNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 flex items-start space-x-3 ${notification.read ? '' : 'bg-accent'}`}
                  >
                    <Link to={`/profile/${notification.actorId}`}>
                      <Avatar>
                        <AvatarImage src={notification.actorAvatar} alt={notification.actorName} />
                        <AvatarFallback>
                          {notification.actorName ? notification.actorName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1">
                      <p>
                        <Link 
                          to={`/profile/${notification.actorId}`}
                          className="font-medium hover:underline"
                        >
                          {notification.actorName}
                        </Link>
                        {" "}
                        {notification.type === "post_like" ? "liked" : "commented on"} your post
                        {notification.content && (
                          <span className="pl-1 text-muted-foreground italic">"{notification.content.length > 30 ? `${notification.content.substring(0, 30)}...` : notification.content}"</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                        {notification.type === "post_like" ? 
                          <Heart className="h-4 w-4 text-red-500" /> : 
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        }
                        <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No post notifications</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="views" className="hilite-card divide-y">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="h-10 w-10 bg-hilite-gray rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-hilite-gray rounded w-4/5"></div>
                        <div className="h-3 bg-hilite-gray rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : viewNotifications.length > 0 ? (
                viewNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 flex items-start space-x-3 ${notification.read ? '' : 'bg-accent'}`}
                  >
                    <Link to={`/profile/${notification.actorId}`}>
                      <Avatar>
                        <AvatarImage src={notification.actorAvatar} alt={notification.actorName} />
                        <AvatarFallback>
                          {notification.actorName ? notification.actorName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1">
                      <p>
                        <Link 
                          to={`/profile/${notification.actorId}`}
                          className="font-medium hover:underline"
                        >
                          {notification.actorName}
                        </Link>
                        {" "}
                        viewed your profile
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No profile view notifications</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
