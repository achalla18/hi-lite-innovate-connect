
import { Link } from "react-router-dom";
import { Bell, Home, MessageCircle, Search, Hash, Users } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const { user } = useAuth();
  
  // Get notifications count
  const { data: notificationsCount = 0 } = useQuery({
    queryKey: ['notificationsCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      // For a real implementation, we would query unread notifications
      // This is a simplified version
      const { data: connections } = await supabase
        .from('connections')
        .select('id')
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');
        
      return connections?.length || 0;
    },
    enabled: !!user
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-hilite-purple">Hi-Lite</span>
          </Link>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <Link to="/discover" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Discover</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Explore posts and trending topics
                        </p>
                      </Link>
                      <Link to="/search" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Search</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Find people, jobs, and more
                        </p>
                      </Link>
                      <Link to="/clubs" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Clubs</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Join interest-based communities
                        </p>
                      </Link>
                      <Link to="/premium" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Premium</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Upgrade for advanced features
                        </p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/network" className={navigationMenuTriggerStyle()}>
                    <Users className="h-4 w-4 mr-1" />
                    My Network
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/discover" className={navigationMenuTriggerStyle()}>
                    <Hash className="h-4 w-4 mr-1" />
                    Discover
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link to="/search" className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search Hi-Lite..."
              className="hilite-input w-48 md:w-64 pl-8 rounded-full"
            />
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Link to="/" className="p-2 hover:bg-accent rounded-md">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
            <Link to="/notifications" className="p-2 hover:bg-accent rounded-md relative">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute top-0 right-0 bg-hilite-dark-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Link>
            <Link to="/messages" className="p-2 hover:bg-accent rounded-md">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Link>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
