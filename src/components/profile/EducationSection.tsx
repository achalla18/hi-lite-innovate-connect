
import { useState } from "react";
import { Calendar, Edit, GraduationCap, Plus, Trash2 } from "lucide-react";
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
import EducationForm from "./EducationForm";

interface EducationProps {
  userId: string;
  isCurrentUser?: boolean;
}

type Education = {
  id: string;
  user_id: string;
  degree: string;
  school: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export default function EducationSection({ userId, isCurrentUser = false }: EducationProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

  // Fetch education data for the user
  const { data: educationData, isLoading } = useQuery({
    queryKey: ['education', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as Education[];
    },
    enabled: !!userId
  });

  const handleEdit = (education: Education) => {
    setSelectedEducation(education);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEducation) return;
    
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', selectedEducation.id);
        
      if (error) throw error;
      
      toast.success("Education entry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['education', userId] });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting education: ${error.message}`);
    }
  };

  const confirmDelete = (education: Education) => {
    setSelectedEducation(education);
    setIsDeleteDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['education', userId] });
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['education', userId] });
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Education</h2>
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
      ) : educationData && educationData.length > 0 ? (
        <div className="space-y-6">
          {educationData.map((edu) => (
            <div key={edu.id} className="relative border-l-2 border-hilite-blue pl-4 pb-2">
              {isCurrentUser && (
                <div className="absolute right-0 top-0 flex space-x-2">
                  <button 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(edu)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => confirmDelete(edu)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-hilite-blue"></div>
              
              <div className="flex items-start justify-between">
                <h3 className="font-bold">{edu.degree}</h3>
              </div>
              
              <div className="text-muted-foreground">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  <span>{edu.school}</span>
                  {edu.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{edu.location}</span>
                    </>
                  )}
                </div>
                
                {(edu.start_date || edu.end_date) && (
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {edu.start_date || 'N/A'} - {edu.end_date || 'Present'}
                    </span>
                  </div>
                )}
              </div>
              
              {edu.description && <p className="mt-2 text-sm">{edu.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          {isCurrentUser ? "Add your education history to help others learn about your background" : "No education information added yet"}
        </div>
      )}

      {/* Add Education Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
          </DialogHeader>
          <EducationForm onComplete={closeAddDialog} />
        </DialogContent>
      </Dialog>

      {/* Edit Education Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
          </DialogHeader>
          {selectedEducation && (
            <EducationForm 
              education={selectedEducation} 
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
              This action cannot be undone. This will permanently delete this education entry from your profile.
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
