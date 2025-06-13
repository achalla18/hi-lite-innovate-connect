import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Crown, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClubMembersProps {
  clubId: string;
}

interface ClubMember {
  id: string;
  userId: string;
  name: string;
  role: string;
  jobTitle: string;
  avatarUrl: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function ClubMembers({ clubId }: ClubMembersProps) {
  const [search, setSearch] = useState("");
  
  // Fetch club members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id(name, role, avatar_url)
        `)
        .eq('club_id', clubId);
        
      if (error) {
        console.error("Error fetching club members:", error);
        return [];
      }
      
      return data.map(member => ({
        id: member.id,
        userId: member.user_id,
        name: member.profiles?.name || 'Anonymous User',
        role: member.role,
        jobTitle: member.profiles?.role || 'Hi-Lite Member',
        avatarUrl: member.profiles?.avatar_url || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=200&fit=crop',
        isOwner: member.role === 'owner',
        isAdmin: member.role === 'admin'
      }));
    },
    enabled: !!clubId
  });
  
  const filteredMembers = members.filter(member => 
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
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-12 w-12 bg-hilite-gray rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-hilite-gray rounded w-1/3"></div>
                  <div className="h-3 bg-hilite-gray rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${member.userId}`} className="h-12 w-12 rounded-full bg-hilite-gray overflow-hidden">
                  <img 
                    src={member.avatarUrl} 
                    alt={member.name} 
                    className="h-full w-full object-cover"
                  />
                </Link>
                
                <div>
                  <div className="flex items-center">
                    <Link to={`/profile/${member.userId}`} className="font-bold hover:text-hilite-purple">
                      {member.name}
                    </Link>
                    {member.isOwner && (
                      <Crown className="h-3 w-3 text-hilite-purple ml-1" />
                    )}
                    {member.isAdmin && (
                      <Shield className="h-3 w-3 text-hilite-purple ml-1" />
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
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No members found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}