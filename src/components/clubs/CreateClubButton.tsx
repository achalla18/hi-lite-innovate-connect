
import { useState } from 'react';
import { Plus, Upload, Lock, Unlock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const clubSchema = z.object({
  name: z.string().min(3, { message: "Club name must be at least 3 characters" }).max(50),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
  isPrivate: z.boolean().default(false),
  tags: z.string().optional(),
});

type ClubFormValues = z.infer<typeof clubSchema>;

export default function CreateClubButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [clubLogo, setClubLogo] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
      tags: '',
    },
  });

  const onSubmit = (data: ClubFormValues) => {
    // In a real app, this would create the club in the database
    console.log('Creating club:', { ...data, coverImage, clubLogo });
    
    toast({
      title: "Club created",
      description: `"${data.name}" has been created successfully.`,
    });
    
    setIsOpen(false);
    form.reset();
    setCoverImage(null);
    setClubLogo(null);
  };

  // Mock file upload - in a real app this would upload to storage
  const handleImageUpload = (type: 'cover' | 'logo') => {
    // Simulate file upload by setting a placeholder image
    if (type === 'cover') {
      setCoverImage('https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&fit=crop');
    } else {
      setClubLogo('https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=200&fit=crop');
    }
  };

  return (
    <>
      <button 
        className="hilite-btn-primary flex items-center"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Club
      </button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Club</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Cover Image</FormLabel>
                <div 
                  className="h-32 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleImageUpload('cover')}
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="h-full w-full object-cover rounded-md" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="w-20">
                  <FormLabel>Club Logo</FormLabel>
                  <div 
                    className="h-20 w-20 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleImageUpload('logo')}
                  >
                    {clubLogo ? (
                      <img src={clubLogo} alt="Logo" className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Club Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter club name" {...field} />
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
                        placeholder="Describe what your club is about" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="JavaScript, Programming, Web Development" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        className={`flex-1 p-3 flex items-center justify-center space-x-2 rounded-md border ${!field.value ? 'border-hilite-purple bg-hilite-purple/10' : 'border-border'}`}
                        onClick={() => form.setValue('isPrivate', false)}
                      >
                        <Unlock className="h-4 w-4" />
                        <span>Public</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`flex-1 p-3 flex items-center justify-center space-x-2 rounded-md border ${field.value ? 'border-hilite-purple bg-hilite-purple/10' : 'border-border'}`}
                        onClick={() => form.setValue('isPrivate', true)}
                      >
                        <Lock className="h-4 w-4" />
                        <span>Private</span>
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {field.value 
                        ? "Only approved members can see content" 
                        : "Anyone can view content and join"}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <button 
                  type="button" 
                  className="hilite-btn-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="hilite-btn-primary"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Creating..." : "Create Club"}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
