
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-hilite-dark-red to-hilite-light-blue">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Join the Innovation Revolution?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Connect with like-minded innovators and start building the future today.
        </p>
        
        <Link to="/register">
          <Button size="lg" variant="secondary" className="text-hilite-dark-red">
            Join Hi-Lite Now
            <Users className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
