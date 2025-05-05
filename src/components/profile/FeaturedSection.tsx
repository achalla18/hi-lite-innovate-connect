
import { Edit, ExternalLink, Globe, Link, Plus } from "lucide-react";

interface FeaturedProps {
  isCurrentUser?: boolean;
}

export default function FeaturedSection({ isCurrentUser = false }: FeaturedProps) {
  const featuredItems = [
    {
      id: 1,
      type: "project",
      title: "AI-Powered Task Manager",
      description: "A task management application that uses machine learning to prioritize tasks and suggest optimal work schedules.",
      link: "https://github.com/janethompson/ai-task-manager",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&fit=crop"
    },
    {
      id: 2,
      type: "article",
      title: "Optimizing React Performance",
      description: "A comprehensive guide on techniques to improve performance in React applications.",
      link: "https://medium.com/@janethompson/optimizing-react-performance",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&fit=crop"
    }
  ];

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Featured</h2>
        {isCurrentUser && (
          <button className="hilite-btn-secondary text-sm flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuredItems.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden bg-card">
            <div className="relative h-32 bg-gradient-to-r from-hilite-light-purple to-hilite-blue">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              {isCurrentUser && (
                <button className="absolute top-2 right-2 bg-background/80 p-1 rounded-full text-foreground hover:bg-background">
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="p-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-base">{item.title}</h3>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                <div className="flex items-center">
                  {item.type === "project" ? (
                    <Globe className="h-4 w-4 mr-1" />
                  ) : (
                    <Link className="h-4 w-4 mr-1" />
                  )}
                  <span className="capitalize">{item.type}</span>
                </div>
              </div>
              
              <p className="text-sm line-clamp-2">{item.description}</p>
              
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 flex items-center text-hilite-purple hover:underline text-sm"
              >
                View {item.type}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
