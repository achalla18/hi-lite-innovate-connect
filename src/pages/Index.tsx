
import Navbar from "@/components/layout/Navbar";
import CreatePostForm from "@/components/post/CreatePostForm";
import PostCard from "@/components/post/PostCard";
import UserStats from "@/components/home/UserStats";
import NetworkSuggestions from "@/components/home/NetworkSuggestions";
import TrendingTopics from "@/components/home/TrendingTopics";

const mockPosts = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Alex Chen",
      role: "Senior Software Engineer at Apple",
      avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop"
    },
    content: "Just launched our new AI-powered feature in production! After months of training models and fine-tuning, it's amazing to see how it's already helping users save time. #MachineLearning #ProductDevelopment",
    images: ["https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&fit=crop"],
    likes: 42,
    comments: 7,
    timeAgo: "3h ago"
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "Jamie Rodriguez",
      role: "UX Designer at Spotify",
      avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop"
    },
    content: "Here's a sneak peek at the design system I've been working on for the past few weeks. What do you think?\n\nI've been focusing on creating a more consistent experience across all platforms while maintaining the unique feel of each platform.",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&fit=crop"
    ],
    likes: 78,
    comments: 15,
    timeAgo: "6h ago"
  },
  {
    id: "3",
    author: {
      id: "user3",
      name: "Taylor Kim",
      role: "Data Scientist at Netflix",
      avatarUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop"
    },
    content: "I'm excited to announce that I'll be speaking at the Data Science Summit next month! I'll be sharing insights on how we're using ML models to enhance content recommendations. If you're attending, let's connect!",
    likes: 126,
    comments: 23,
    timeAgo: "1d ago"
  }
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Sidebar */}
            <div className="hidden lg:block">
              <UserStats />
              <TrendingTopics />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              <CreatePostForm />
              
              {mockPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <NetworkSuggestions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
