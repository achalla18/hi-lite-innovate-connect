
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Upload } from "lucide-react";
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

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  role: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  isInitialSetup?: boolean;
  onComplete?: () => void;
}

export default function EditProfileForm({ isInitialSetup = false, onComplete }: EditProfileFormProps) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      role: profile?.role || "",
      location: profile?.location || "",
      about: profile?.about || "",
      avatarUrl: profile?.avatar_url || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          role: values.role,
          location: values.location,
          avatar_url: values.avatarUrl,
          about: values.about
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      await refreshProfile();
      
      if (isInitialSetup) {
        // Navigate to user's profile page
        navigate(`/profile/${user.id}`);
      } else if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={form.watch("avatarUrl") || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="https://example.com/avatar.jpg" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1 h-7"
                            disabled
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Basic Info */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer, Student, etc." {...field} />
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
                    <FormLabel className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell others about yourself" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4">
                {!isInitialSetup && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => onComplete ? onComplete() : navigate(-1)}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit"
                  className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isInitialSetup ? "Complete Profile" : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
