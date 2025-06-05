
import { GraduationCap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <GraduationCap className="h-6 w-6 text-hilite-dark-red" />
            <span className="text-xl font-bold text-hilite-dark-red">Hi-lite</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-hilite-dark-red">Privacy Policy</a>
            <a href="#" className="hover:text-hilite-dark-red">Terms of Service</a>
            <a href="#" className="hover:text-hilite-dark-red">Contact</a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2024 Hi-Lite. All rights reserved. Built for the innovators of tomorrow.
        </div>
      </div>
    </footer>
  );
}
