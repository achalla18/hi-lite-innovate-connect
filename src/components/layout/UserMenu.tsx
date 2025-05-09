
import { LogOut, Settings, User, BookOpen, Award, Laptop } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function UserMenu() {
  const { profile, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <div className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent group-data-[state=open]:bg-accent">
          <Avatar className="h-9 w-9 border-2 border-transparent transition-colors group-hover:border-hilite-dark-red">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
            <AvatarFallback className="bg-hilite-light-blue text-hilite-dark-red font-bold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only md:not-sr-only md:mr-2 md:text-sm font-medium hidden md:block">
            {profile?.name?.split(' ')[0] || "Profile"}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="flex flex-col space-y-2 p-2">
          <p className="text-lg font-semibold">{profile?.name || "User"}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{profile?.role || "Complete your profile"}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <Link to="/profile">
          <DropdownMenuItem className="cursor-pointer group">
            <User className="mr-2 h-4 w-4 group-hover:text-hilite-dark-red transition-colors" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/settings">
          <DropdownMenuItem className="cursor-pointer group">
            <Settings className="mr-2 h-4 w-4 group-hover:text-hilite-dark-red transition-colors" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Student Resources</DropdownMenuLabel>
        <Link to="/clubs">
          <DropdownMenuItem className="cursor-pointer group">
            <BookOpen className="mr-2 h-4 w-4 group-hover:text-hilite-dark-red transition-colors" />
            <span>Study Groups</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/network">
          <DropdownMenuItem className="cursor-pointer group">
            <Award className="mr-2 h-4 w-4 group-hover:text-hilite-dark-red transition-colors" />
            <span>Academic Network</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/discover">
          <DropdownMenuItem className="cursor-pointer group">
            <Laptop className="mr-2 h-4 w-4 group-hover:text-hilite-dark-red transition-colors" />
            <span>Learning Resources</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50 font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
