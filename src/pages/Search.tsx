
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Search, User, FileText, Briefcase, GraduationCap, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Mock search results
  const searchResults = {
    users: [
      {
        id: "user1",
        name: "Alex Chen",
        role: "Senior Software Engineer at Apple",
        avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop"
      },
      {
        id: "user2",
        name: "Jamie Rodriguez",
        role: "UX Designer at Spotify",
        avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop"
      }
    ],
    posts: [
      {
        id: "post1",
        title: "The Future of AI in Web Development",
        author: "Alex Chen",
        preview: "Exploring how AI is changing the landscape of web development...",
        timeAgo: "3h ago"
      },
      {
        id: "post2",
        title: "Designing for Accessibility: A Comprehensive Guide",
        author: "Jamie Rodriguez",
        preview: "Learn how to make your websites accessible to everyone...",
        timeAgo: "1d ago"
      }
    ],
    companies: [
      {
        id: "company1",
        name: "TechFlow Inc",
        industry: "Software Development",
        logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop"
      }
    ],
    schools: [
      {
        id: "school1",
        name: "Stanford University",
        type: "University",
        logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop"
      }
    ]
  };
  
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
          <div className="space-y-6">
            {/* People Results */}
            {(filter === "all" || filter === "people") && (
              <div>
                <h2 className="text-xl font-bold mb-4">People</h2>
                <div className="space-y-4">
                  {searchResults.users.map(user => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className="hilite-card flex items-center space-x-4 hover:shadow-md"
                    >
                      <div className="h-12 w-12 rounded-full bg-hilite-gray overflow-hidden">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Posts Results */}
            {(filter === "all" || filter === "posts") && (
              <div>
                <h2 className="text-xl font-bold mb-4">Posts</h2>
                <div className="space-y-4">
                  {searchResults.posts.map(post => (
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
            
            {/* Companies Results */}
            {(filter === "all" || filter === "companies") && (
              <div>
                <h2 className="text-xl font-bold mb-4">Companies</h2>
                <div className="space-y-4">
                  {searchResults.companies.map(company => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="hilite-card flex items-center space-x-4 hover:shadow-md"
                    >
                      <div className="h-12 w-12 rounded bg-hilite-gray overflow-hidden">
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.industry}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Schools Results */}
            {(filter === "all" || filter === "schools") && (
              <div>
                <h2 className="text-xl font-bold mb-4">Schools</h2>
                <div className="space-y-4">
                  {searchResults.schools.map(school => (
                    <Link
                      key={school.id}
                      to={`/school/${school.id}`}
                      className="hilite-card flex items-center space-x-4 hover:shadow-md"
                    >
                      <div className="h-12 w-12 rounded bg-hilite-gray overflow-hidden">
                        <img
                          src={school.logo}
                          alt={school.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{school.name}</h3>
                        <p className="text-sm text-muted-foreground">{school.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
