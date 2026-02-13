import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "AI Researcher",
    content: "Hi-Lite helped me connect with specialists across product and engineering. Our research prototype became a launch-ready product in months.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Startup Founder",
    content: "The quality of people here is exceptional. I met a technical cofounder and two early advisors through the platform.",
    rating: 5,
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Innovation Director",
    content: "A strong bridge between academia and industry. The collaboration features are clean, fast, and genuinely useful.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-4 py-20 md:py-24">
      <div className="container">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Trusted by ambitious builders</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Professionals use Hi-Lite to find momentum, mentors, and mission-aligned collaborators.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="h-full border-border/70 bg-card/80">
              <CardHeader>
                <div className="mb-2 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed text-foreground/90">“{testimonial.content}”</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
