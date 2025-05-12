
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { GraduationCap, Calendar } from "lucide-react";

const educationFormSchema = z.object({
  degree: z.string().min(2, {
    message: "Degree must be at least 2 characters."
  }),
  school: z.string().min(2, {
    message: "School name must be at least 2 characters."
  }),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

type EducationType = {
  id?: string;
  degree: string;
  school: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface EducationFormProps {
  education?: EducationType;
  onComplete: () => void;
  isEdit?: boolean;
}

export default function EducationForm({ education, onComplete, isEdit = false }: EducationFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof educationFormSchema>>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      degree: education?.degree || "",
      school: education?.school || "",
      location: education?.location || "",
      startDate: education?.start_date || "",
      endDate: education?.end_date || "",
      description: education?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof educationFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEdit && education?.id) {
        // Update existing education record
        const { error } = await supabase
          .from('education')
          .update({
            degree: values.degree,
            school: values.school,
            location: values.location,
            start_date: values.startDate,
            end_date: values.endDate,
            description: values.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', education.id);
        
        if (error) throw error;
        toast.success("Education updated successfully");
      } else {
        // Insert new education record
        const { error } = await supabase
          .from('education')
          .insert({
            user_id: user.id,
            degree: values.degree,
            school: values.school,
            location: values.location,
            start_date: values.startDate,
            end_date: values.endDate,
            description: values.description
          });
        
        if (error) throw error;
        toast.success("Education added successfully");
      }
      
      onComplete();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <FormControl>
                <Input placeholder="Bachelor of Science in Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-1" />
                School or University
              </FormLabel>
              <FormControl>
                <Input placeholder="Stanford University" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Stanford, CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sep 2018" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  End Date
                </FormLabel>
                <FormControl>
                  <Input placeholder="Jun 2022 (or Present)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Specialized in Computer Science with focus on Machine Learning." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onComplete}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Education"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
