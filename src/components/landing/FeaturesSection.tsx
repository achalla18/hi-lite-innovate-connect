
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lightbulb, 
  Rocket, 
  Network,
  MessageCircle
} from "lucide-react";

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

export function FeaturesSection() {
  return (
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
  );
}
