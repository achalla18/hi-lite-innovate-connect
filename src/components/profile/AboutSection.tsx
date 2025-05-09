
import { useState } from "react";
import { Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AboutSectionProps {
  isCurrentUser?: boolean;
  initialBio?: string;
}

export default function AboutSection({ 
  isCurrentUser = false, 
  initialBio = "" 
}: AboutSectionProps) {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [editedBio, setEditedBio] = useState(initialBio);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ about: editedBio })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setBio(editedBio);
      setIsEditing(false);
      await refreshProfile();
      toast.success("Bio updated successfully");
    } catch (error: any) {
      toast.error(`Failed to update bio: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">About</h2>
        {isCurrentUser && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            className="w-full h-32 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hilite-light-blue focus:border-hilite-light-blue"
            placeholder="Write something about yourself..."
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setEditedBio(bio);
                setIsEditing(false);
              }}
              className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-hilite-dark-red hover:bg-hilite-dark-red/90 text-white text-sm font-medium rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground whitespace-pre-wrap">
          {bio ? bio : (
            <span className="text-muted-foreground italic">
              {isCurrentUser ? "Add information about yourself..." : "No information added yet."}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
