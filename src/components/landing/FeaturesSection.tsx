import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Rocket, Network, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "Smart Networking",
    description: "Find highly relevant people in your domain, then expand through trusted second-degree introductions.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Workspaces",
    description: "Share ideas, gather feedback, and iterate in focused spaces designed for real project delivery.",
  },
  {
    icon: MessageCircle,
    title: "Real-time Collaboration",
    description: "Coordinate with peers and mentors through fast messaging built for active teams.",
  },
  {
    icon: Rocket,
    title: "Portfolio Visibility",
    description: "Showcase milestones, case studies, and outcomes to stand out to collaborators and recruiters.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 md:py-24">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Designed for modern professional growth</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything in Hi-Lite is purpose-built to help ambitious people collaborate and ship impactful work.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="group h-full border-border/70 bg-card/70 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-hilite-light-blue/10">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-hilite-light-blue/10 text-hilite-dark-red transition-colors group-hover:bg-hilite-dark-red/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
