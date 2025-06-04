
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeaturedProps {
  isCurrentUser?: boolean;
  profileData?: any;
}

export default function FeaturedSection({ isCurrentUser = false, profileData }: FeaturedProps) {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [featuredContent, setFeaturedContent] = useState("");

  // Update local state when profileData changes
  useEffect(() => {
    if (profileData?.awards !== undefined) {
      setFeaturedContent(profileData.awards || "");
    }
  }, [profileData]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ awards: featuredContent })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Featured content updated successfully");
      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Error updating featured content: ${error.message}`);
    }
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Featured</h2>
        {isCurrentUser && (
          <button 
            className="hilite-btn-secondary text-sm flex items-center"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={featuredContent}
            onChange={(e) => setFeaturedContent(e.target.value)}
            placeholder="Add content you want to feature (projects, articles, etc.)"
            className="min-h-[150px]"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setFeaturedContent(profileData?.awards || "");
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : featuredContent ? (
        <div className="whitespace-pre-wrap">
          {featuredContent}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          {isCurrentUser ? (
            "Add your featured projects, articles, or other content you want to highlight"
          ) : (
            "No featured content available yet"
          )}
        </div>
      )}
    </div>
  );
}
