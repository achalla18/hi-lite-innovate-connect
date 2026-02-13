import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="px-4 py-20 md:py-24">
      <div className="container">
        <div className="rounded-2xl border bg-gradient-to-r from-hilite-dark-red to-hilite-light-blue p-8 text-center shadow-2xl shadow-hilite-dark-red/20 md:p-12">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Ready to elevate your professional network?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Join Hi-Lite to collaborate with high-potential peers, build your public portfolio, and discover new opportunities.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full text-hilite-dark-red sm:w-auto">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
                I already have access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
