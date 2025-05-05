
import { Link } from "react-router-dom";
import { Bell, Home, MessageCircle, Search, User } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-hilite-purple">Hi-Lite</span>
          </Link>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/search"
              className="text-sm font-medium transition-colors hover:text-hilite-purple"
            >
              Discover
            </Link>
            <Link
              to="/network"
              className="text-sm font-medium transition-colors hover:text-hilite-purple"
            >
              My Network
            </Link>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search Hi-Lite..."
              className="hilite-input w-48 md:w-64 pl-8 rounded-full"
            />
          </div>
          
          <nav className="flex items-center space-x-2">
            <Link to="/" className="p-2 hover:bg-accent rounded-md">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
            <Link to="/notifications" className="p-2 hover:bg-accent rounded-md">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
            <Link to="/messages" className="p-2 hover:bg-accent rounded-md">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Link>
            <ThemeToggle />
            <Link to="/profile" className="p-2 hover:bg-accent rounded-md">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
