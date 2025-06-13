import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, Smartphone, Eye, EyeOff } from "lucide-react";
import TwoFactorSetup from "@/components/auth/TwoFactorSetup";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";

export default function AccountSecurity() {
  const { user, hasTwoFactorEnabled } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (!isPasswordStrong) {
      toast.error("Please create a stronger password");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Then update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      toast.error(`Failed to update password: ${error.message}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Account Security</h1>
          
          <Tabs defaultValue="password" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="password" className="flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="2fa" className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Two-Factor Authentication
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Create a new password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {newPassword && (
                        <PasswordStrengthIndicator 
                          password={newPassword} 
                          onStrengthChange={setIsPasswordStrong}
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-hilite-dark-red hover:bg-hilite-dark-red/90"
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || !isPasswordStrong}
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="2fa">
              <TwoFactorSetup />
            </TabsContent>
          </Tabs>
          
          <Card className="mt-6 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Shield className="h-5 w-5 mr-2" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Recent security events for your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center py-6">
                <Shield className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h3 className="text-lg font-semibold mb-1">No security alerts</h3>
                <p className="text-muted-foreground">
                  Your account is secure. We'll notify you if we detect any suspicious activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}