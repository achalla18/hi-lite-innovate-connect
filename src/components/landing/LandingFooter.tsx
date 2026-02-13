import { GraduationCap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/20 px-4 py-10">
      <div className="container flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div>
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <GraduationCap className="h-5 w-5 text-hilite-dark-red" />
            <span className="text-base font-bold">Hi-Lite</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Professional social network for innovators and builders.</p>
        </div>

        <div className="flex gap-5 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
          <a href="#" className="transition-colors hover:text-foreground">Terms</a>
          <a href="#" className="transition-colors hover:text-foreground">Support</a>
        </div>
      </div>
      <div className="container mt-6 border-t pt-5 text-center text-xs text-muted-foreground">
        © 2026 Hi-Lite Innovate Connect. All rights reserved.
      </div>
    </footer>
  );
}
