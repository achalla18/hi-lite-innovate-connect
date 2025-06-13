import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ClubCard from "@/components/clubs/ClubCard";
import CreateClubButton from "@/components/clubs/CreateClubButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Folder, FolderOpen, FolderLock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function Clubs() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private" | "my">("all");
  
  // Fetch clubs data from Supabase
  const { data: clubsData = [], isLoading } = useQuery({
    queryKey: ['clubs', searchQuery, filter, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('clubs')
        .select(`
          *,
          club_members!inner(user_id, role)
        `);
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      if (filter === "public") {
        query = query.eq('is_private', false);
      } else if (filter === "private") {
        query = query.eq('is_private', true);
      } else if (filter === "my" && user) {
        query = query.eq('club_members.user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching clubs:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: true
  });

  // Format clubs data for display
  const formattedClubs = clubsData.map(club => ({
    id: club.id,
    name: club.name,
    description: club.description || "",
    imageUrl: club.image_url,
    coverImageUrl: club.cover_image_url,
    isPrivate: club.is_private || false,
    createdAt: club.created_at,
    memberCount: club.member_count || 0,
    owner: {
      id: club.owner_id || "unknown",
      name: "Club Owner",
      avatarUrl: null
    },
    tags: club.tags || []
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Clubs</h1>
              <p className="text-muted-foreground">
                Join communities of like-minded professionals
              </p>
            </div>
            <CreateClubButton />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="md:col-span-1">
              <div className="hilite-card mb-4">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search clubs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="border-t border-border">
                  <button
                    className={`w-full text-left p-3 flex items-center space-x-2 ${filter === "all" ? "bg-accent" : "hover:bg-accent"}`}
                    onClick={() => setFilter("all")}
                  >
                    <Folder className="h-5 w-5 text-muted-foreground" />
                    <span>All Clubs</span>
                  </button>
                  
                  <button
                    className={`w-full text-left p-3 flex items-center space-x-2 ${filter === "public" ? "bg-accent" : "hover:bg-accent"}`}
                    onClick={() => setFilter("public")}
                  >
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    <span>Public Clubs</span>
                  </button>
                  
                  <button
                    className={`w-full text-left p-3 flex items-center space-x-2 ${filter === "private" ? "bg-accent" : "hover:bg-accent"}`}
                    onClick={() => setFilter("private")}
                  >
                    <FolderLock className="h-5 w-5 text-muted-foreground" />
                    <span>Private Clubs</span>
                  </button>
                  
                  {user && (
                    <button
                      className={`w-full text-left p-3 flex items-center space-x-2 ${filter === "my" ? "bg-accent" : "hover:bg-accent"}`}
                      onClick={() => setFilter("my")}
                    >
                      <Folder className="h-5 w-5 text-hilite-purple" />
                      <span>My Clubs</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="hilite-card p-4">
                      <div className="h-24 bg-muted animate-pulse rounded mb-4"></div>
                      <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : formattedClubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formattedClubs.map(club => (
                    <ClubCard key={club.id} club={club} />
                  ))}
                </div>
              ) : (
                <div className="hilite-card p-8 text-center">
                  <div className="mb-4">
                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No clubs found</h2>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try a different search term" : "Be the first to create a club in this community"}
                  </p>
                  <CreateClubButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}