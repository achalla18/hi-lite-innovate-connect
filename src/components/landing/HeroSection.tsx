
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-20 px-4 text-center bg-gradient-to-br from-hilite-light-blue/10 via-background to-hilite-dark-red/5">
      <div className="container">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          The Innovation Network
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-hilite-dark-red to-hilite-light-blue bg-clip-text text-transparent">
          Connect. Innovate. Transform.
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join the premier social network for innovators, researchers, and entrepreneurs. 
          Share ideas, build connections, and shape the future together.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="bg-hilite-dark-red hover:bg-hilite-dark-red/90">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Free to join</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Verified community</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Global network</span>
          </div>
        </div>
      </div>
    </section>
  );
}
