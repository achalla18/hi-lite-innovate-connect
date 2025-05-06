
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Search, User, FileText, Briefcase, GraduationCap, Filter, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search for users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['searchUsers', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${debouncedSearchTerm}%`)
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2
  });

  // Search for posts
  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['searchPosts', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*, user_id')
        .ilike('content', `%${debouncedSearchTerm}%`)
        .limit(5);
        
      if (postsError) throw postsError;
      if (!posts || posts.length === 0) return [];
      
      // Get profile data for post authors
      const userIds = [...new Set(posts.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      // Format post data with author information
      return posts.map(post => {
        const authorProfile = profilesData?.find(profile => profile.id === post.user_id) || {
          name: 'Unknown User',
          role: ''
        };
        
        return {
          id: post.id,
          title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
          preview: post.content.substring(0, 120) + (post.content.length > 120 ? '...' : ''),
          author: authorProfile.name || 'Unknown User',
          timeAgo: formatTimeAgo(new Date(post.created_at))
        };
      });
    },
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2
  });

  // Format time ago helper function
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return 'just now';
  };

  const isSearching = debouncedSearchTerm.length >= 2;
  const noResults = isSearching && 
    !isLoadingUsers && 
    !isLoadingPosts && 
    (!usersData || usersData.length === 0) && 
    (!postsData || postsData.length === 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Search</h1>
          
          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for people, posts, companies, or schools..."
              className="hilite-input w-full py-3 pl-10 pr-4"
            />
          </div>
          
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full flex items-center ${filter === "all" ? "bg-hilite-purple text-white" : "bg-secondary text-foreground"}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              All
            </button>
            <button
              onClick={() => setFilter("people")}
              className={`px-4 py-2 rounded-full flex items-center ${filter === "people" ? "bg-hilite-purple text-white" : "bg-secondary text-foreground"}`}
            >
              <User className="h-4 w-4 mr-2" />
              People
            </button>
            <button
              onClick={() => setFilter("posts")}
              className={`px-4 py-2 rounded-full flex items-center ${filter === "posts" ? "bg-hilite-purple text-white" : "bg-secondary text-foreground"}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Posts
            </button>
            <button
              onClick={() => setFilter("companies")}
              className={`px-4 py-2 rounded-full flex items-center ${filter === "companies" ? "bg-hilite-purple text-white" : "bg-secondary text-foreground"}`}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Companies
            </button>
            <button
              onClick={() => setFilter("schools")}
              className={`px-4 py-2 rounded-full flex items-center ${filter === "schools" ? "bg-hilite-purple text-white" : "bg-secondary text-foreground"}`}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Schools
            </button>
          </div>
          
          {/* Search Results */}
          {debouncedSearchTerm.length < 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Start typing to search</p>
              <p className="text-sm">Search requires at least 2 characters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Loading state */}
              {(isLoadingUsers || isLoadingPosts) && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-hilite-purple" />
                </div>
              )}
              
              {/* No results message */}
              {noResults && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-bold">No results found</h3>
                  <p className="text-muted-foreground">Try a different search term</p>
                </div>
              )}
              
              {/* People Results */}
              {(filter === "all" || filter === "people") && usersData && usersData.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">People</h2>
                  <div className="space-y-4">
                    {usersData.map(user => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        className="hilite-card flex items-center space-x-4 hover:shadow-md"
                      >
                        <div className="h-12 w-12 rounded-full bg-hilite-gray overflow-hidden">
                          <img
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.name || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold">{user.name || "Unnamed User"}</h3>
                          <p className="text-sm text-muted-foreground">{user.role || "Hi-Lite Member"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Posts Results */}
              {(filter === "all" || filter === "posts") && postsData && postsData.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Posts</h2>
                  <div className="space-y-4">
                    {postsData.map(post => (
                      <Link
                        key={post.id}
                        to={`/post/${post.id}`}
                        className="hilite-card block hover:shadow-md"
                      >
                        <h3 className="font-bold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">By {post.author} • {post.timeAgo}</p>
                        <p className="text-sm line-clamp-2">{post.preview}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Companies and Schools sections - replaced with message that they are coming soon */}
              {(filter === "all" || filter === "companies" || filter === "schools") && (
                <div className="text-center py-8 bg-secondary/20 rounded-md">
                  <h3 className="text-lg font-bold mb-2">
                    {filter === "companies" ? "Companies" : filter === "schools" ? "Schools" : "Companies & Schools"}
                  </h3>
                  <p className="text-muted-foreground">
                    This feature is coming soon. Check back later!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
