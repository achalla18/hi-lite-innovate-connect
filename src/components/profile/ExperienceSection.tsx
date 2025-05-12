
import { useState } from "react";
import { Briefcase, Calendar, Edit, Plus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExperienceForm from "./ExperienceForm";

interface ExperienceProps {
  userId: string;
  isCurrentUser?: boolean;
}

type Experience = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export default function ExperienceSection({ userId, isCurrentUser = false }: ExperienceProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  // Fetch experience data for the user
  const { data: experienceData, isLoading } = useQuery({
    queryKey: ['experience', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as Experience[];
    },
    enabled: !!userId
  });

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedExperience) return;
    
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', selectedExperience.id);
        
      if (error) throw error;
      
      toast.success("Experience entry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['experience', userId] });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting experience: ${error.message}`);
    }
  };

  const confirmDelete = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDeleteDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['experience', userId] });
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['experience', userId] });
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Experience</h2>
        {isCurrentUser && (
          <button 
            className="hilite-btn-secondary text-sm flex items-center"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse bg-muted rounded-md"></div>
          <div className="h-24 animate-pulse bg-muted rounded-md"></div>
        </div>
      ) : experienceData && experienceData.length > 0 ? (
        <div className="space-y-6">
          {experienceData.map((exp) => (
            <div key={exp.id} className="relative border-l-2 border-hilite-purple pl-4 pb-2">
              {isCurrentUser && (
                <div className="absolute right-0 top-0 flex space-x-2">
                  <button 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(exp)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => confirmDelete(exp)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-hilite-purple"></div>
              
              <div className="flex items-start justify-between">
                <h3 className="font-bold">{exp.title}</h3>
              </div>
              
              <div className="text-muted-foreground">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{exp.company}</span>
                  {exp.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{exp.location}</span>
                    </>
                  )}
                </div>
                
                {(exp.start_date || exp.end_date) && (
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {exp.start_date || 'N/A'} - {exp.end_date || 'Present'}
                    </span>
                  </div>
                )}
              </div>
              
              {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          {isCurrentUser ? "Add your work experience to showcase your professional background" : "No work experience added yet"}
        </div>
      )}

      {/* Add Experience Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Experience</DialogTitle>
          </DialogHeader>
          <ExperienceForm onComplete={closeAddDialog} />
        </DialogContent>
      </Dialog>

      {/* Edit Experience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          {selectedExperience && (
            <ExperienceForm 
              experience={selectedExperience} 
              onComplete={closeEditDialog} 
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this experience entry from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
