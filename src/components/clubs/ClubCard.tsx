import { Link } from "react-router-dom";
import { Club } from "@/types/club";
import { Users, Lock } from "lucide-react";

interface ClubCardProps {
  club: Club;
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <Link to={`/club/${club.id}`} className="hilite-card overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-24 bg-hilite-gray overflow-hidden">
        {club.coverImageUrl && (
          <img 
            src={club.coverImageUrl} 
            alt={club.name} 
            className="h-full w-full object-cover"
          />
        )}
      </div>
      
      <div className="p-4 flex items-start">
        <div className="h-12 w-12 rounded-lg overflow-hidden mr-3 bg-hilite-purple flex-shrink-0">
          {club.imageUrl ? (
            <img src={club.imageUrl} alt={club.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white font-bold">
              {club.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-bold text-sm truncate mr-1">{club.name}</h3>
            {club.isPrivate && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {club.description}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          <span>{club.memberCount} members</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {club.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="bg-accent rounded px-2 py-0.5">
              {tag}
            </span>
          ))}
          {(club.tags?.length || 0) > 2 && (
            <span className="bg-accent rounded px-2 py-0.5">+{(club.tags?.length || 0) - 2}</span>
          )}
        </div>
      </div>
    </Link>
  );
}