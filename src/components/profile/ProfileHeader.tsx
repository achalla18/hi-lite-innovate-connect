
import { Link } from "react-router-dom";
import { Edit, MapPin, Briefcase, GraduationCap, Volume2 } from "lucide-react";

interface ProfileHeaderProps {
  isCurrentUser?: boolean;
}

export default function ProfileHeader({ isCurrentUser = false }: ProfileHeaderProps) {
  return (
    <div className="hilite-card mb-4">
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 md:h-48 rounded-t-lg bg-gradient-to-r from-hilite-dark-red to-hilite-light-blue"></div>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-4 md:left-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-hilite-gray">
              <img
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            {isCurrentUser && (
              <button className="absolute bottom-0 right-0 bg-hilite-dark-red text-white p-1 rounded-full">
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {isCurrentUser ? (
          <div className="absolute top-4 right-4 space-x-2">
            <button className="hilite-btn-secondary text-sm">Edit Profile</button>
          </div>
        ) : (
          <div className="absolute top-4 right-4 space-x-2 flex">
            <button className="hilite-btn-secondary text-sm">Message</button>
            <button className="hilite-btn-primary text-sm">Connect</button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="mt-14 md:mt-16 px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Jane Thompson</h1>
          <button className="text-muted-foreground hover:text-foreground">
            <Volume2 className="h-4 w-4" />
          </button>
          <div className="px-2 py-1 text-xs bg-hilite-light-blue text-hilite-dark-red rounded-full">
            Open to Work
          </div>
        </div>

        <h2 className="text-lg text-muted-foreground">Full-Stack Developer & UI/UX Designer</h2>
        
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1" />
            <Link to="/company/techflow" className="hover:text-hilite-dark-red">TechFlow Inc</Link>
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-1" />
            <Link to="/school/stanford" className="hover:text-hilite-dark-red">Stanford University</Link>
            <span className="ml-2 px-2 py-0.5 bg-accent rounded-full text-xs font-mono">Currently Attending</span>
          </div>
        </div>

        <div className="flex mt-4 space-x-4 text-sm">
          <div>
            <span className="font-bold">1,248</span> connections
          </div>
          <div>
            <span className="font-bold">3,427</span> followers
          </div>
        </div>
      </div>
    </div>
  );
}
