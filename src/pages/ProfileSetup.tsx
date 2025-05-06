
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Briefcase, 
  GraduationCap, 
  MapPin,
  Upload,
  Laptop,
  Trophy
} from "lucide-react";

export default function ProfileSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    role: profile?.role || "",
    location: profile?.location || "",
    about: "",
    avatarUrl: profile?.avatar_url || "",
    education: [{
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      current: false
    }],
    experience: [{
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }],
    skills: [""],
    projects: [{
      title: "",
      description: "",
      url: ""
    }]
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  };
  
  const handleEducationChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, education: newEducation };
    });
  };
  
  const handleSkillChange = (index: number, value: string) => {
    setFormData(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      return { ...prev, skills: newSkills };
    });
  };
  
  const handleProjectChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };
  
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: ""
        }
      ]
    }));
  };
  
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          current: false
        }
      ]
    }));
  };
  
  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, ""]
    }));
  };
  
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          url: ""
        }
      ]
    }));
  };
  
  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };
  
  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };
  
  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  
  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete your profile",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          location: formData.location,
          avatar_url: formData.avatarUrl
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Additional fields like experience, education, etc. would be inserted
      // into their respective tables in a production app
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      });
      
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error Updating Profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Add your information to help others find and connect with you
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                  
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={formData.avatarUrl || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <Input 
                        type="text" 
                        placeholder="Profile Image URL" 
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter an image URL or upload a photo (upload coming soon)
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <Input 
                        type="text" 
                        placeholder="John Doe" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Professional Headline</label>
                      <Input 
                        type="text" 
                        placeholder="Software Engineer" 
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <Input 
                      type="text" 
                      placeholder="San Francisco, CA" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">About</label>
                    <Textarea 
                      placeholder="Tell others about yourself" 
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Experience */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Experience
                  </h2>
                  
                  {formData.experience.map((exp, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        {formData.experience.length > 1 && (
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => removeExperience(index)}
                          >
                            ×
                          </Button>
                        )}
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">Company</label>
                            <Input 
                              type="text" 
                              placeholder="Company Name" 
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input 
                              type="text" 
                              placeholder="Job Title" 
                              value={exp.title}
                              onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <Input 
                            type="text" 
                            placeholder="Work Location" 
                            value={exp.location}
                            onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <Input 
                              type="month" 
                              value={exp.startDate}
                              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            />
                          </div>
                          
                          {!exp.current && (
                            <div>
                              <label className="block text-sm font-medium mb-1">End Date</label>
                              <Input 
                                type="month" 
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <input 
                            type="checkbox" 
                            id={`current-job-${index}`} 
                            className="mr-2"
                            checked={exp.current}
                            onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                          />
                          <label htmlFor={`current-job-${index}`} className="text-sm">
                            I currently work here
                          </label>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Textarea 
                            placeholder="Job responsibilities and achievements" 
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={addExperience}
                  >
                    + Add Another Experience
                  </Button>
                </div>
                
                <Separator />
                
                {/* Education */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </h2>
                  
                  {formData.education.map((edu, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        {formData.education.length > 1 && (
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => removeEducation(index)}
                          >
                            ×
                          </Button>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">School</label>
                          <Input 
                            type="text" 
                            placeholder="University Name" 
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Degree</label>
                            <Input 
                              type="text" 
                              placeholder="Bachelor's, Master's, etc." 
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Field of Study</label>
                            <Input 
                              type="text" 
                              placeholder="Computer Science" 
                              value={edu.fieldOfStudy}
                              onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <Input 
                              type="month" 
                              value={edu.startDate}
                              onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                            />
                          </div>
                          
                          {!edu.current && (
                            <div>
                              <label className="block text-sm font-medium mb-1">End Date</label>
                              <Input 
                                type="month" 
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <input 
                            type="checkbox" 
                            id={`current-edu-${index}`} 
                            className="mr-2"
                            checked={edu.current}
                            onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                          />
                          <label htmlFor={`current-edu-${index}`} className="text-sm">
                            I'm currently studying here
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={addEducation}
                  >
                    + Add Another Education
                  </Button>
                </div>
                
                <Separator />
                
                {/* Skills */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Laptop className="w-5 h-5 mr-2" />
                    Skills
                  </h2>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <Input 
                          type="text" 
                          placeholder="e.g. React, JavaScript" 
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                        />
                        
                        {formData.skills.length > 1 && (
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="ml-2 h-8 w-8 p-0"
                            onClick={() => removeSkill(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={addSkill}
                  >
                    + Add Another Skill
                  </Button>
                </div>
                
                <Separator />
                
                {/* Projects */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Projects
                  </h2>
                  
                  {formData.projects.map((project, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        {formData.projects.length > 1 && (
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => removeProject(index)}
                          >
                            ×
                          </Button>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Project Title</label>
                          <Input 
                            type="text" 
                            placeholder="Project Name" 
                            value={project.title}
                            onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-1">URL</label>
                          <Input 
                            type="text" 
                            placeholder="https://..." 
                            value={project.url}
                            onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Textarea 
                            placeholder="What did you build? What technologies did you use?" 
                            value={project.description}
                            onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={addProject}
                  >
                    + Add Another Project
                  </Button>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit"
                    className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
