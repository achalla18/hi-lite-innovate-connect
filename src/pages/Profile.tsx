
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import FeaturedSection from "@/components/profile/FeaturedSection";
import PostCard from "@/components/post/PostCard";

const mockPosts = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Jane Thompson",
      role: "Full-Stack Developer & UI/UX Designer",
      avatarUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"
    },
    content: "Just finished a major refactoring of our codebase. Reduced bundle size by 35% and improved load times by 40%. It's amazing what you can achieve with proper code splitting and lazy loading! #WebPerformance #ReactJS",
    images: ["https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&fit=crop"],
    likes: 56,
    comments: 8,
    timeAgo: "2d ago"
  },
  {
    id: "2",
    author: {
      id: "user1",
      name: "Jane Thompson",
      role: "Full-Stack Developer & UI/UX Designer",
      avatarUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"
    },
    content: "I'm excited to share that I'll be speaking at the Frontend Developers Conference next month! I'll be talking about building accessible interfaces with React and TypeScript. Let me know if you'll be attending!",
    likes: 124,
    comments: 19,
    timeAgo: "1w ago"
  }
];

export default function Profile() {
  const isCurrentUser = true;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <ProfileHeader isCurrentUser={isCurrentUser} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar with profile info */}
            <div className="space-y-4">
              <AboutSection isCurrentUser={isCurrentUser} />
              <FeaturedSection isCurrentUser={isCurrentUser} />
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <ExperienceSection isCurrentUser={isCurrentUser} />
              <EducationSection isCurrentUser={isCurrentUser} />
              
              <h2 className="text-xl font-bold mt-6 mb-4">Posts</h2>
              {mockPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
