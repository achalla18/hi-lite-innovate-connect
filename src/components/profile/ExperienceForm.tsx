
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
import { Briefcase, Calendar } from "lucide-react";

const experienceFormSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters."
  }),
  company: z.string().min(2, {
    message: "Company name must be at least 2 characters."
  }),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

type ExperienceType = {
  id?: string;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface ExperienceFormProps {
  experience?: ExperienceType;
  onComplete: () => void;
  isEdit?: boolean;
}

export default function ExperienceForm({ experience, onComplete, isEdit = false }: ExperienceFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof experienceFormSchema>>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: experience?.title || "",
      company: experience?.company || "",
      location: experience?.location || "",
      startDate: experience?.start_date || "",
      endDate: experience?.end_date || "",
      description: experience?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof experienceFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEdit && experience?.id) {
        // Update existing experience record
        const { error } = await supabase
          .from('experience')
          .update({
            title: values.title,
            company: values.company,
            location: values.location,
            start_date: values.startDate,
            end_date: values.endDate,
            description: values.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', experience.id);
        
        if (error) throw error;
        toast.success("Experience updated successfully");
      } else {
        // Insert new experience record
        const { error } = await supabase
          .from('experience')
          .insert({
            user_id: user.id,
            title: values.title,
            company: values.company,
            location: values.location,
            start_date: values.startDate,
            end_date: values.endDate,
            description: values.description
          });
        
        if (error) throw error;
        toast.success("Experience added successfully");
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                Company
              </FormLabel>
              <FormControl>
                <Input placeholder="Google, Inc." {...field} />
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
                <Input placeholder="Mountain View, CA" {...field} />
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
                  <Input placeholder="Jan 2020" {...field} />
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
                  <Input placeholder="Dec 2022 (or Present)" {...field} />
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
                  placeholder="Led a team of 5 developers to build and maintain core product features." 
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
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Experience"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
