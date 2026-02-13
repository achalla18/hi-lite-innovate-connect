import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeCheck, GraduationCap } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Community", href: "#community" },
  { label: "Testimonials", href: "#testimonials" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-hilite-dark-red/10 p-1.5">
            <GraduationCap className="h-5 w-5 text-hilite-dark-red" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Hi-Lite</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register" className="hidden sm:block">
            <Button size="sm" className="bg-hilite-dark-red hover:bg-hilite-dark-red/90">
              <BadgeCheck className="mr-1.5 h-4 w-4" />
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
