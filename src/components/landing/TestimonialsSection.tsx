
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "AI Researcher",
    content: "Hi-Lite connected me with amazing collaborators for my machine learning project.",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "Startup Founder",
    content: "The networking opportunities here are unmatched. Found my co-founder through Hi-Lite!",
    rating: 5
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Innovation Director",
    content: "A game-changer for academic-industry collaboration. Highly recommended!",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Community Says
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "{testimonial.content}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
