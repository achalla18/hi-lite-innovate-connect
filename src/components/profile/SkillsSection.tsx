
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ThumbsUp } from "lucide-react";

interface SkillsSectionProps {
  userId: string;
  isCurrentUser?: boolean;
}

export default function SkillsSection({ userId, isCurrentUser = false }: SkillsSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Fetch user's skills
  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', userId)
        .order('endorsement_count', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const { error } = await supabase
        .from('skills')
        .insert({
          user_id: userId,
          skill_name: skillName
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', userId] });
      setNewSkill("");
      setIsAdding(false);
      toast.success("Skill added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add skill: ${error.message}`);
    }
  });

  // Endorse skill mutation
  const endorseSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('skill_endorsements')
        .insert({
          skill_id: skillId,
          endorser_id: user?.id
        });
        
      if (error) throw error;
      
      // Update skill endorsement count
      const { error: updateError } = await supabase.rpc('increment_skill_endorsement', {
        skill_id: skillId
      });
      
      if (updateError) console.error('Error updating endorsement count:', updateError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', userId] });
      toast.success("Skill endorsed!");
    },
    onError: (error: any) => {
      toast.error(`Failed to endorse skill: ${error.message}`);
    }
  });

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkillMutation.mutate(newSkill.trim());
    }
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Skills</h2>
        {isCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-hilite-purple"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Skill
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2 mb-4">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Enter a skill..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <Button onClick={handleAddSkill} disabled={addSkillMutation.isPending}>
            Add
          </Button>
          <Button variant="outline" onClick={() => setIsAdding(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded-md"></div>
          <div className="h-8 bg-muted animate-pulse rounded-md"></div>
        </div>
      ) : skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <div key={skill.id} className="flex items-center gap-1">
              <Badge variant="secondary" className="text-sm">
                {skill.skill_name}
                {skill.endorsement_count > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {skill.endorsement_count}
                  </span>
                )}
              </Badge>
              {!isCurrentUser && user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => endorseSkillMutation.mutate(skill.id)}
                  disabled={endorseSkillMutation.isPending}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          {isCurrentUser ? "Add your skills to showcase your expertise" : "No skills added yet"}
        </p>
      )}
    </div>
  );
}
