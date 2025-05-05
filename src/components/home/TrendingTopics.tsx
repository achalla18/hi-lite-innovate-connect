
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrendingTopics() {
  const trendingTopics = [
    {
      id: "1",
      topic: "Machine Learning",
      posts: 743,
      link: "/topics/machine-learning"
    },
    {
      id: "2",
      topic: "Web3",
      posts: 568,
      link: "/topics/web3"
    },
    {
      id: "3",
      topic: "UI/UX Design",
      posts: 421,
      link: "/topics/ui-ux-design"
    },
    {
      id: "4",
      topic: "Remote Work",
      posts: 295,
      link: "/topics/remote-work"
    }
  ];

  return (
    <div className="hilite-card mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-hilite-purple" />
        <h2 className="text-lg font-bold">Trending Topics</h2>
      </div>
      
      <div className="space-y-3">
        {trendingTopics.map((topic) => (
          <Link 
            key={topic.id} 
            to={topic.link}
            className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
          >
            <div className="font-medium">#{topic.topic}</div>
            <div className="text-sm text-muted-foreground">{topic.posts} posts</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
