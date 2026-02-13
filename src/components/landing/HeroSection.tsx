import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Sparkles, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-hilite-light-blue/10 via-background to-background px-4 py-20 md:py-24">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-hilite-dark-red/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-hilite-light-blue/20 blur-3xl" />

      <div className="container relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge variant="secondary" className="mb-6 border border-border bg-background/80 backdrop-blur">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            A professional innovation community
          </Badge>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Build meaningful connections that move ideas forward.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Hi-Lite helps students, researchers, and founders collaborate, share progress, and discover opportunities in one premium social experience.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="w-full bg-hilite-dark-red hover:bg-hilite-dark-red/90 sm:w-auto">
                Join the network
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {[
              "Trusted by student leaders",
              "Secure sign-in",
              "Curated community",
            ].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-2xl shadow-hilite-dark-red/10">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Live community momentum</p>
            <Users className="h-4 w-4 text-hilite-dark-red" />
          </div>
          <div className="space-y-4">
            {[
              { label: "New members this week", value: "+1,284" },
              { label: "Cross-discipline clubs", value: "96" },
              { label: "Projects in collaboration", value: "1,900+" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-hilite-dark-red">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
