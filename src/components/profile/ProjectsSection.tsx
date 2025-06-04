
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProjectsProps {
  isCurrentUser?: boolean;
  profileData?: any;
}

export default function ProjectsSection({ isCurrentUser = false, profileData }: ProjectsProps) {
  const { user, refreshProfile } = useAuth();
  const [projectsText, setProjectsText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when profileData changes
  useEffect(() => {
    if (profileData?.projects !== undefined) {
      setProjectsText(profileData.projects || "");
    }
  }, [profileData]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ projects: projectsText })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Projects updated successfully");
      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Error updating projects: ${error.message}`);
    }
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
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
            value={projectsText} 
            onChange={(e) => setProjectsText(e.target.value)} 
            placeholder="Describe your projects"
            className="min-h-[150px]"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                setProjectsText(profileData?.projects || "");
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
      ) : (
        <div>
          {projectsText ? (
            <p className="whitespace-pre-wrap">{projectsText}</p>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              {isCurrentUser 
                ? "Add information about your current and past projects" 
                : "No projects information available yet"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
