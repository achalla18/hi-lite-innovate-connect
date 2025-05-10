import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Club } from "@/types/club";
import { ClubPost } from "@/types/club";
import PostCard from "@/components/post/PostCard";
import ClubChatPanel from "@/components/clubs/ClubChatPanel";
import ClubMembers from "@/components/clubs/ClubMembers";
import CreatePostForm from "@/components/post/CreatePostForm";
import { Users, MessageSquare, Lock, Unlock, Settings, Calendar } from "lucide-react";

// Mock club data
const mockClub: Club = {
  id: "1",
  name: "JavaScript Enthusiasts",
  description: "A group for JavaScript developers to share knowledge and resources about the latest frameworks, libraries, and best practices. Join us to learn and grow together!",
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
};

// Mock club posts
const mockClubPosts: ClubPost[] = [
  {
    id: "1",
    clubId: "1",
    author: {
      id: "user1",
      name: "Alex Chen",
      role: "Senior Software Engineer at Apple",
      avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop"
    },
    content: "Just shared my new JavaScript utility library on GitHub! It's designed to make handling async operations more intuitive. Check it out and let me know what you think. #JavaScript #OpenSource",
    images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&fit=crop"],
    likes: 24,
    comments: 5,
    timeAgo: "2h ago"
  },
  {
    id: "2",
    clubId: "1",
    author: {
      id: "user2",
      name: "Jamie Rodriguez",
      role: "Frontend Developer at Spotify",
      avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop"
    },
    content: "Has anyone tried the new React Server Components yet? I'm curious about real-world performance improvements and developer experience.",
    likes: 18,
    comments: 12,
    timeAgo: "1d ago"
  }
];

export default function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeTab, setActiveTab] = useState<"feed" | "chat" | "members">("feed");
  const [isMember, setIsMember] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // For a real app, fetch the club data based on the clubId
  const club = mockClub;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative">
          {/* Cover image */}
          <div className="h-40 md:h-56 w-full bg-hilite-gray overflow-hidden">
            {club.coverImageUrl && (
              <img 
                src={club.coverImageUrl} 
                alt={club.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Club info section */}
          <div className="container relative -mt-16">
            <div className="hilite-card">
              <div className="flex flex-col md:flex-row md:items-end p-4 pt-16 md:pt-4">
                <div className="absolute -top-14 left-4 md:relative md:top-0 md:left-0 h-24 w-24 rounded-lg overflow-hidden border-4 border-background">
                  {club.imageUrl ? (
                    <img src={club.imageUrl} alt={club.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-hilite-purple flex items-center justify-center text-white text-2xl font-bold">
                      {club.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="md:ml-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl md:text-2xl font-bold">{club.name}</h1>
                    {club.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">{club.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {club.tags?.map(tag => (
                      <span key={tag} className="text-xs bg-accent px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-2">
                  {isMember ? (
                    <>
                      <button className="hilite-btn-secondary text-sm">Leave Club</button>
                      {isOwner && (
                        <Link to={`/clubs/${club.id}/settings`} className="hilite-btn-secondary text-sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Link>
                      )}
                    </>
                  ) : (
                    <button 
                      className="hilite-btn-primary text-sm"
                      onClick={() => setIsMember(true)}
                    >
                      Join Club
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex border-t border-border">
                <button 
                  className={`flex-1 py-3 px-2 flex justify-center items-center space-x-1 
                    ${activeTab === "feed" ? "border-b-2 border-hilite-purple text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("feed")}
                >
                  Feed
                </button>
                <button 
                  className={`flex-1 py-3 px-2 flex justify-center items-center space-x-1 
                    ${activeTab === "chat" ? "border-b-2 border-hilite-purple text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Chat</span>
                </button>
                <button 
                  className={`flex-1 py-3 px-2 flex justify-center items-center space-x-1 
                    ${activeTab === "members" ? "border-b-2 border-hilite-purple text-foreground" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("members")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <span>Members ({club.memberCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block">
              <div className="hilite-card mb-4">
                <div className="p-4 border-b border-border">
                  <h3 className="text-lg font-bold">About</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-bold">{club.memberCount} members</div>
                      <div className="text-sm text-muted-foreground">Including your connections</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-bold">Created on</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(club.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    {club.isPrivate ? (
                      <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    ) : (
                      <Unlock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{club.isPrivate ? "Private Club" : "Public Club"}</div>
                      <div className="text-sm text-muted-foreground">
                        {club.isPrivate 
                          ? "Only members can see content" 
                          : "Anyone can view content"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === "feed" && (
                <>
                  {isMember && <CreatePostForm clubId={club.id} />}
                  {mockClubPosts.map(post => (
                    <PostCard key={post.id} post={{
                      id: post.id,
                      author: {
                        id: post.author.id,
                        name: post.author.name,
                        role: post.author.role,
                        avatarUrl: post.author.avatarUrl || '/placeholder.svg'
                      },
                      content: post.content,
                      images: post.images,
                      likes: post.likes,
                      comments: post.comments,
                      timeAgo: post.timeAgo,
                      isLiked: false
                    }} />
                  ))}
                </>
              )}
              
              {activeTab === "chat" && <ClubChatPanel clubId={club.id} />}
              
              {activeTab === "members" && <ClubMembers clubId={club.id} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
