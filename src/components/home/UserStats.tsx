
import { BarChartIcon, Users, Eye, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface UserStatsProps {
  connections?: number;
  profileViews?: number;
  searchAppearances?: number;
}

export default function UserStats({
  connections = 354,
  profileViews = 125,
  searchAppearances = 48
}: UserStatsProps) {
  return (
    <div className="hilite-card mb-4">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <BarChartIcon className="h-5 w-5 text-hilite-purple" />
            <h2 className="text-lg font-bold">Your Network Stats</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Insights visible to only you
          </p>
        </div>
      </div>
      
      <div className="space-y-1">
        <Link 
          to="/connections" 
          className="flex justify-between items-center p-4 hover:bg-accent rounded-none transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-mono text-sm">Connections</div>
              <div className="font-bold">{connections}</div>
            </div>
          </div>
          <div className="text-sm text-hilite-purple flex items-center">
            <span>+28 this month</span>
          </div>
        </Link>
        
        <Link
          to="/profile/analytics" 
          className="flex justify-between items-center p-4 hover:bg-accent rounded-none transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-mono text-sm">Who viewed your profile</div>
              <div className="font-bold">{profileViews}</div>
            </div>
          </div>
          <div className="text-sm text-hilite-purple flex items-center">
            <span>+15% this week</span>
          </div>
        </Link>
        
        <Link
          to="/search-appearances" 
          className="flex justify-between items-center p-4 hover:bg-accent rounded-none border-t border-border transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-mono text-sm">Search appearances</div>
              <div className="font-bold">{searchAppearances}</div>
            </div>
          </div>
          <div className="text-sm text-hilite-purple flex items-center">
            <span>Grow your network</span>
          </div>
        </Link>
      </div>
      
      <div className="p-4 border-t border-border">
        <Link to="/premium" className="text-sm text-hilite-purple hover:underline">
          Get more insights with Hi-Lite Premium →
        </Link>
      </div>
    </div>
  );
}
