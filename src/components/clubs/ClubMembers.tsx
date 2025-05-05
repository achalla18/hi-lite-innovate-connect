
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClubMembersProps {
  clubId: string;
}

// Mock member data
const mockMembers = [
  {
    id: "user1",
    name: "Alex Chen",
    role: "Owner",
    jobTitle: "Senior Software Engineer at Apple",
    avatarUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop",
    isOwner: true
  },
  {
    id: "user2",
    name: "Jamie Rodriguez",
    role: "Admin",
    jobTitle: "Frontend Developer at Spotify",
    avatarUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop",
    isAdmin: true
  },
  {
    id: "user3",
    name: "Taylor Kim",
    role: "Member",
    jobTitle: "Data Scientist at Netflix",
    avatarUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=200&h=200&fit=crop"
  },
  {
    id: "user4",
    name: "Jane Thompson",
    role: "Member",
    jobTitle: "Full-Stack Developer & UI/UX Designer",
    avatarUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"
  },
  {
    id: "user5",
    name: "Morgan Lee",
    role: "Member",
    jobTitle: "Product Manager at Google",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop"
  },
  {
    id: "user6",
    name: "Chris Johnson",
    role: "Member",
    jobTitle: "Cloud Architect at Microsoft",
    avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop"
  }
];

export default function ClubMembers({ clubId }: ClubMembersProps) {
  const [search, setSearch] = useState("");
  
  const filteredMembers = mockMembers.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hilite-card">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {filteredMembers.map(member => (
          <div key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/profile/${member.id}`} className="h-12 w-12 rounded-full bg-hilite-gray overflow-hidden">
                <img 
                  src={member.avatarUrl} 
                  alt={member.name} 
                  className="h-full w-full object-cover"
                />
              </Link>
              
              <div>
                <div className="flex items-center">
                  <Link to={`/profile/${member.id}`} className="font-bold hover:text-hilite-purple">
                    {member.name}
                  </Link>
                  {member.isOwner && (
                    <Crown className="h-3 w-3 text-hilite-purple ml-1" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{member.jobTitle}</div>
                {(member.isOwner || member.isAdmin) && (
                  <div className="text-xs text-hilite-purple mt-1">{member.role}</div>
                )}
              </div>
            </div>
            
            <button className="hilite-btn-secondary text-xs">Message</button>
          </div>
        ))}
      </div>
    </div>
  );
}
