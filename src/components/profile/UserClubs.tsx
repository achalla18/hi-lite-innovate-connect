
import { Link } from "react-router-dom";
import { Club } from "@/types/club";
import { Folder, Plus, Edit } from "lucide-react";

interface UserClubsProps {
  isCurrentUser?: boolean;
}

// Mock clubs data
const mockUserClubs: Club[] = [
  {
    id: "1",
    name: "JavaScript Enthusiasts",
    description: "A group for JavaScript developers to share knowledge and resources.",
    imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=200&fit=crop",
    isPrivate: false,
    createdAt: "2023-01-15",
    memberCount: 248,
    owner: {
      id: "user1",
      name: "Alex Chen",
      avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop"
    }
  },
  {
    id: "3",
    name: "UX Design Community",
    description: "Share design tips, feedback, and stay updated on UX trends.",
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&fit=crop",
    isPrivate: false,
    createdAt: "2023-02-10",
    memberCount: 324,
    owner: {
      id: "user3",
      name: "Taylor Kim",
      avatarUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop"
    }
  }
];

export default function UserClubs({ isCurrentUser = false }: UserClubsProps) {
  return (
    <div className="hilite-card">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-hilite-purple" />
          <h2 className="text-lg font-bold">Clubs</h2>
        </div>
        
        {isCurrentUser && (
          <Link to="/clubs" className="text-hilite-purple text-sm hover:underline">
            <Plus className="h-4 w-4 inline mr-1" />
            Join Clubs
          </Link>
        )}
      </div>
      
      <div>
        {mockUserClubs.map(club => (
          <Link 
            key={club.id}
            to={`/clubs/${club.id}`} 
            className="flex items-center p-4 hover:bg-accent border-b border-border last:border-b-0"
          >
            <div className="h-10 w-10 rounded-lg bg-hilite-gray overflow-hidden mr-3">
              {club.imageUrl ? (
                <img src={club.imageUrl} alt={club.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-hilite-purple flex items-center justify-center text-white font-bold">
                  {club.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="font-bold text-sm">{club.name}</div>
              <div className="text-xs text-muted-foreground">{club.memberCount} members</div>
            </div>
            
            {isCurrentUser && (
              <div className="text-sm text-hilite-purple">
                <Edit className="h-4 w-4" />
              </div>
            )}
          </Link>
        ))}
        
        {mockUserClubs.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-3">Not a member of any clubs yet</p>
            <Link to="/clubs" className="hilite-btn-primary inline-flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Browse Clubs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
