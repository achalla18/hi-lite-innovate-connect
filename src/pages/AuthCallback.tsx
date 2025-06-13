import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function AuthCallback() {
  const [message, setMessage] = useState("Processing your authentication...");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash and parse it
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        // Check for access token which indicates successful auth
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          setMessage("Authentication successful! Redirecting...");
          
          // Check if this is a new user (email verification)
          const { data } = await supabase.auth.getUser();
          const isNewUser = data?.user?.created_at === data?.user?.updated_at;
          
          // Redirect to appropriate page
          setTimeout(() => {
            navigate(isNewUser ? "/profile-setup" : "/", { replace: true });
          }, 1500);
        } else {
          // Check for error in URL
          const errorDescription = params.get("error_description");
          if (errorDescription) {
            setError(errorDescription);
          } else {
            setError("Authentication failed. Please try again.");
          }
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-hilite-dark-red" />
            <span className="text-2xl font-bold text-hilite-dark-red">Hi-lite</span>
          </div>
          <CardTitle>{error ? "Authentication Error" : "Authentication"}</CardTitle>
          <CardDescription>
            {error ? "There was a problem with your authentication" : "Completing your authentication process"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {error ? (
            <div className="space-y-4">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => navigate("/login")}
                className="text-hilite-dark-red hover:underline"
              >
                Return to login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-hilite-dark-red border-t-transparent rounded-full"></div>
              </div>
              <p>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}