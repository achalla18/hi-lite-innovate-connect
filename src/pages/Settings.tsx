import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Shield,
  Bell,
  User,
  Settings as SettingsIcon,
  LogOut,
  Lock,
  Upload
} from "lucide-react";

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [role, setRole] = useState(profile?.role || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setRole(profile.role || "");
      setLocation(profile.location || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  // Fetch user settings
  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user settings:", error);
        return {
          email_notifications: true,
          push_notifications: true,
          theme: 'light'
        };
      }
      
      return data;
    },
    enabled: !!user
  });

  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', user?.id] });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          role,
          location,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotification = (type: 'email_notifications' | 'push_notifications', value: boolean) => {
    if (!userSettings) return;
    
    updateSettingsMutation.mutate({
      [type]: value
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="container py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
          
          <Tabs defaultValue="profile">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                  <TabsTrigger 
                    value="profile" 
                    className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-accent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-accent"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-accent"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account" 
                    className="w-full justify-start px-3 py-2 h-auto data-[state=active]:bg-accent"
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <TabsContent value="profile" className="m-0">
                  <div className="hilite-card">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <Separator className="mb-4" />
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarUrl} alt={name} />
                        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Profile Picture</p>
                        <p className="text-sm text-muted-foreground">
                          JPG or PNG. 1MB max.
                        </p>
                        <div className="flex items-center mt-2">
                          <Input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="Image URL"
                            className="text-xs h-8 mr-2"
                          />
                          <Button variant="outline" size="sm" className="h-8">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email
                          </Label>
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your email cannot be changed
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="role" className="text-sm font-medium">
                            Professional Headline
                          </Label>
                          <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="E.g., Student at Lincoln High School"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="location" className="text-sm font-medium">
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="E.g., San Francisco, CA"
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-hilite-dark-red hover:bg-hilite-dark-red/90"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="m-0">
                  <div className="hilite-card">
                    <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                    <Separator className="mb-4" />
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about activity via email
                          </p>
                        </div>
                        <Switch 
                          checked={userSettings?.email_notifications || false}
                          onCheckedChange={(checked) => handleToggleNotification('email_notifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Push Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications on your device
                          </p>
                        </div>
                        <Switch 
                          checked={userSettings?.push_notifications || false}
                          onCheckedChange={(checked) => handleToggleNotification('push_notifications', checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Notification Types</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notify-connections" className="text-sm font-normal">
                              Connection requests
                            </Label>
                            <Switch id="notify-connections" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notify-messages" className="text-sm font-normal">
                              Messages
                            </Label>
                            <Switch id="notify-messages" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notify-mentions" className="text-sm font-normal">
                              Mentions and tags
                            </Label>
                            <Switch id="notify-mentions" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notify-posts" className="text-sm font-normal">
                              Post reactions and comments
                            </Label>
                            <Switch id="notify-posts" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notify-events" className="text-sm font-normal">
                              Events and reminders
                            </Label>
                            <Switch id="notify-events" defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="m-0">
                  <div className="hilite-card">
                    <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                    <Separator className="mb-4" />
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Update your password to keep your account secure
                        </p>
                        <Link to="/account/security">
                          <Button variant="outline" className="bg-hilite-dark-red/5 border-hilite-dark-red/20 text-hilite-dark-red hover:bg-hilite-dark-red/10">
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </Link>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Add an extra layer of security to your account
                        </p>
                        <Link to="/account/security">
                          <Button variant="outline" className="bg-hilite-dark-red/5 border-hilite-dark-red/20 text-hilite-dark-red hover:bg-hilite-dark-red/10">
                            <Shield className="h-4 w-4 mr-2" />
                            {userSettings?.two_factor_enabled ? "Manage 2FA" : "Enable 2FA"}
                          </Button>
                        </Link>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium">Login History</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          View your recent login activity
                        </p>
                        <div className="bg-muted p-3 rounded-md text-sm">
                          <div className="flex justify-between mb-2">
                            <span>Current session</span>
                            <span className="text-green-600 font-medium">Active now</span>
                          </div>
                          <div className="text-muted-foreground">
                            {new Date().toLocaleString()} • {navigator.platform}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="account" className="m-0">
                  <div className="hilite-card">
                    <h2 className="text-xl font-semibold mb-4">Account Management</h2>
                    <Separator className="mb-4" />
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium">Account Type</h3>
                        <p className="text-sm text-muted-foreground">
                          Free Account
                        </p>
                        <Link to="/premium">
                          <Button variant="outline" className="mt-2">
                            Upgrade to Premium
                          </Button>
                        </Link>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium">Data Export</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Download a copy of your data
                        </p>
                        <Button variant="outline">
                          Request Data Export
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium text-red-500">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Permanently delete your account and all associated data
                        </p>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}