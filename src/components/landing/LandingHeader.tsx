
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-hilite-dark-red" />
          <span className="text-2xl font-bold text-hilite-dark-red">Hi-lite</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Button variant="outline" disabled>
            Invite Only
          </Button>
        </div>
      </div>
    </header>
  );
}
