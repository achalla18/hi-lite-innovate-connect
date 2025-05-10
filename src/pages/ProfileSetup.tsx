
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EditProfileForm from "@/components/profile/EditProfileForm";

export default function ProfileSetup() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Add your information to help others find and connect with you. 
                Your profile will be available at {window.location.origin}/user/{user.id}
              </CardDescription>
            </CardHeader>
            
            <EditProfileForm isInitialSetup={true} />
          </Card>
        </div>
      </main>
    </div>
  );
}
