
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  Lightbulb, 
  Rocket, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Network,
  MessageCircle
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Network className="h-6 w-6" />,
      title: "Smart Networking",
      description: "Connect with innovators, entrepreneurs, and thought leaders in your field"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation Hub",
      description: "Share ideas, collaborate on projects, and turn concepts into reality"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Real-time Collaboration",
      description: "Chat, discuss, and work together on breakthrough innovations"
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Project Showcase",
      description: "Display your work, get feedback, and inspire the next generation"
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-hilite-dark-red" />
            <span className="text-2xl font-bold text-hilite-dark-red">Hi-lite</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-hilite-dark-red hover:bg-hilite-dark-red/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Hi-Lite?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for innovators, researchers, and forward-thinking professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-hilite-light-blue/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-hilite-light-blue/10 flex items-center justify-center text-hilite-dark-red mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-hilite-light-blue/5">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-hilite-dark-red mb-2">10K+</div>
              <div className="text-muted-foreground">Active Innovators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-hilite-dark-red mb-2">50+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-hilite-dark-red mb-2">1000+</div>
              <div className="text-muted-foreground">Projects Launched</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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

      {/* CTA Section */}
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

      {/* Footer */}
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
    </div>
  );
}
