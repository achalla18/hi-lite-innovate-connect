
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

export default function NetworkSuggestions() {
  const suggestedConnections = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Software Engineer at Google",
      avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop",
      mutualConnections: 12
    },
    {
      id: "2",
      name: "Sam Rivera",
      role: "Data Scientist at Tesla",
      avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop",
      mutualConnections: 8
    },
    {
      id: "3",
      name: "Morgan Chen",
      role: "Product Manager at Airbnb",
      avatarUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop",
      mutualConnections: 5
    }
  ];

  return (
    <div className="hilite-card">
      <h2 className="text-lg font-bold mb-4">People you may know</h2>
      <div className="space-y-4">
        {suggestedConnections.map((person) => (
          <div key={person.id} className="flex items-start space-x-3">
            <Link to={`/profile/${person.id}`} className="h-10 w-10 rounded-full bg-hilite-gray overflow-hidden flex-shrink-0">
              <img
                src={person.avatarUrl}
                alt={person.name}
                className="h-full w-full object-cover"
              />
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${person.id}`} className="font-bold hover:text-hilite-purple truncate block">
                {person.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">{person.role}</p>
              <p className="text-xs text-muted-foreground mt-1">{person.mutualConnections} mutual connections</p>
            </div>
            
            <button className="hilite-btn-secondary text-xs flex items-center flex-shrink-0">
              <UserPlus className="h-3 w-3 mr-1" />
              Connect
            </button>
          </div>
        ))}
      </div>
      
      <Link to="/network" className="hilite-link block text-center text-sm mt-4">
        View more
      </Link>
    </div>
  );
}
