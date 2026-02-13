import { Link } from "react-router-dom";
import { Bell, Home, MessageCircle, Search, Hash, Users, GraduationCap } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const { user } = useAuth();

  const { data: notificationsCount = 0 } = useQuery({
    queryKey: ["notificationsCount", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data: connections } = await supabase
        .from("connections")
        .select("id")
        .eq("connected_user_id", user.id)
        .eq("status", "pending");

      return connections?.length || 0;
    },
    enabled: !!user,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-lg">
      <div className="container flex h-16 items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-hilite-purple/10 p-1.5">
              <GraduationCap className="h-4 w-4 text-hilite-purple" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Hi-Lite</span>
          </Link>

          <div className="hidden lg:flex lg:items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[420px] gap-2 p-3 md:w-[520px] md:grid-cols-2">
                      {[ 
                        { to: "/discover", title: "Discover", description: "Explore posts and trending topics" },
                        { to: "/search", title: "Search", description: "Find people, clubs, and opportunities" },
                        { to: "/clubs", title: "Clubs", description: "Join focused communities" },
                        { to: "/premium", title: "Premium", description: "Unlock advanced tools" },
                      ].map((item) => (
                        <Link key={item.to} to={item.to} className="block rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent focus:bg-accent">
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                          <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/network" className={navigationMenuTriggerStyle()}>
                    <Users className="mr-1 h-4 w-4" />
                    My Network
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/discover" className={navigationMenuTriggerStyle()}>
                    <Hash className="mr-1 h-4 w-4" />
                    Discover
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <Link to="/search" className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-44 rounded-full border-border/80 bg-background pl-9 md:w-60"
            />
          </Link>

          <nav className="flex items-center gap-1">
            <Link to="/" className="rounded-md p-2 transition-colors hover:bg-accent" aria-label="Home">
              <Home className="h-5 w-5" />
            </Link>
            <Link to="/notifications" className="relative rounded-md p-2 transition-colors hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-hilite-dark-red px-1 text-[10px] font-semibold text-white">
                  {notificationsCount > 9 ? "9+" : notificationsCount}
                </span>
              )}
            </Link>
            <Link to="/messages" className="rounded-md p-2 transition-colors hover:bg-accent" aria-label="Messages">
              <MessageCircle className="h-5 w-5" />
            </Link>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
