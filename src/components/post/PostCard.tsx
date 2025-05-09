
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Share2 } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      role: string;
      avatarUrl: string;
    };
    content: string;
    images?: string[];
    likes: number;
    comments: number;
    timeAgo: string;
    isLiked: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  
  const toggleLike = () => {
    // In a real implementation, this would call an API to like/unlike the post
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };
  
  return (
    <div className="bg-card p-4 rounded-lg mb-4 border border-border shadow-sm">
      <div className="flex items-start space-x-3 mb-3">
        <Link to={`/profile/${post.author.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${post.author.id}`} className="font-semibold hover:text-hilite-dark-red">
            {post.author.name}
          </Link>
          <p className="text-sm text-muted-foreground">{post.author.role}</p>
          <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
      </div>
      
      {post.images && post.images.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-2">
          {post.images.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Post image ${index + 1}`} 
              className="rounded-lg max-h-96 w-full object-cover"
            />
          ))}
        </div>
      )}
      
      <div className="flex justify-between text-sm text-muted-foreground pt-2">
        <div className="flex items-center space-x-1">
          <Heart className="h-4 w-4 text-hilite-dark-red" />
          <span>{likesCount}</span>
        </div>
        
        <div className="flex space-x-4">
          <span>{post.comments} comments</span>
          <span>0 shares</span>
        </div>
      </div>
      
      <div className="border-t border-border mt-3 pt-3 flex justify-between">
        <button 
          className={`flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent ${isLiked ? 'text-hilite-dark-red' : ''}`}
          onClick={toggleLike}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-hilite-dark-red' : ''}`} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>
        
        <button className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent">
          <MessageSquare className="h-5 w-5" />
          <span>Comment</span>
        </button>
        
        <button className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-accent">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
