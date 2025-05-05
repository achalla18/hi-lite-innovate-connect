
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ClubCard from "@/components/clubs/ClubCard";
import CreateClubButton from "@/components/clubs/CreateClubButton";
import { Club } from "@/types/club";
import { Folder, FolderOpen, FolderLock, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock clubs data
const mockClubs: Club[] = [
  {
    id: "1",
    name: "JavaScript Enthusiasts",
    description: "A group for JavaScript developers to share knowledge and resources.",
    imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=200&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop",
    isPrivate: false,
    createdAt: "2023-01-15",
    memberCount: 248,
    owner: {
      id: "user1",
      name: "Alex Chen",
      avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop"
    },
    tags: ["JavaScript", "Web Development", "Frontend"]
  },
  {
    id: "2",
    name: "AI Research Group",
    description: "Discussing the latest in artificial intelligence and machine learning.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&fit=crop",
    isPrivate: true,
    createdAt: "2023-03-22",
    memberCount: 156,
    owner: {
      id: "user2",
      name: "Jamie Rodriguez",
      avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop"
    },
    tags: ["AI", "Machine Learning", "Data Science"]
  },
  {
    id: "3",
    name: "UX Design Community",
    description: "Share design tips, feedback, and stay updated on UX trends.",
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&fit=crop",
    isPrivate: false,
    createdAt: "2023-02-10",
    memberCount: 324,
    owner: {
      id: "user3",
      name: "Taylor Kim",
      avatarUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop"
    },
    tags: ["UX", "Design", "UI"]
  }
];

export default function Clubs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  
  const filteredClubs = mockClubs.filter(club => {
    // Apply search filter
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply privacy filter
    const matchesPrivacy = filter === "all" || 
                          (filter === "public" && !club.isPrivate) || 
                          (filter === "private" && club.isPrivate);
    
    return matchesSearch && matchesPrivacy;
  });

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
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              {filteredClubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredClubs.map(club => (
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
                    {searchQuery ? "Try a different search term" : "There are no clubs that match your filter"}
                  </p>
                  <button 
                    className="hilite-btn-primary flex items-center mx-auto"
                    onClick={() => {
                      setSearchQuery("");
                      setFilter("all");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create a new club
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
