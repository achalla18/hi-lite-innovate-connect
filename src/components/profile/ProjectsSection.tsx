
import { useState } from "react";
import { Code, ExternalLink, Edit, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectsProps {
  isCurrentUser?: boolean;
}

export default function ProjectsSection({ isCurrentUser = false }: ProjectsProps) {
  const { user, profile } = useAuth();
  const [projectsText, setProjectsText] = useState(profile?.projects || "");
  const [isEditing, setIsEditing] = useState(false);

  // Basic project display from text field in profile
  // Note: In a real application, you might want to create a separate projects table
  // similar to education and experience for more structured data
  
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
          <Input 
            value={projectsText} 
            onChange={(e) => setProjectsText(e.target.value)} 
            placeholder="Describe your projects"
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                setProjectsText(profile?.projects || "");
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!user) return;
                
                try {
                  const { error } = await supabase
                    .from('profiles')
                    .update({ projects: projectsText })
                    .eq('id', user.id);
                    
                  if (error) throw error;
                  
                  toast.success("Projects updated successfully");
                  setIsEditing(false);
                } catch (error: any) {
                  toast.error(`Error updating projects: ${error.message}`);
                }
              }}
            >
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
