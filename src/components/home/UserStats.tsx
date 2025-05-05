
interface UserStatsProps {
  profileViews?: number;
  postImpressions?: number;
  searchAppearances?: number;
}

export default function UserStats({
  profileViews = 125,
  postImpressions = 1432,
  searchAppearances = 48
}: UserStatsProps) {
  return (
    <div className="hilite-card mb-4">
      <h2 className="text-lg font-bold mb-2">Your Dashboard</h2>
      <div className="text-sm text-muted-foreground mb-4">Private to you</div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
          <div>
            <div className="font-bold">{profileViews}</div>
            <div className="text-sm text-muted-foreground">Profile views</div>
          </div>
          <div className="text-sm text-hilite-purple">+15%</div>
        </div>
        
        <div className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
          <div>
            <div className="font-bold">{postImpressions}</div>
            <div className="text-sm text-muted-foreground">Post impressions</div>
          </div>
          <div className="text-sm text-hilite-purple">+32%</div>
        </div>
        
        <div className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
          <div>
            <div className="font-bold">{searchAppearances}</div>
            <div className="text-sm text-muted-foreground">Search appearances</div>
          </div>
          <div className="text-sm text-hilite-purple">+8%</div>
        </div>
      </div>
    </div>
  );
}
