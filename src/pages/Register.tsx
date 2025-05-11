
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signUp, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // First check if email is already in use
      const { data: existingUser } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      // Check with the Supabase backend directly
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('email', email);
      
      if (countError) {
        // Use alternative approach - try signin and see if it fails with wrong password
        const { error: checkError } = await supabase.auth.signInWithPassword({
          email,
          password: "dummy_password_just_to_check", // This will fail but tell us if the email exists
        });
        
        if (!checkError || checkError.message.toLowerCase().includes("invalid login")) {
          toast.error("Email already in use. Please use a different email address.");
          setIsSubmitting(false);
          return;
        }
      } else if (count && count > 0) {
        toast.error("Email already in use. Please use a different email address.");
        setIsSubmitting(false);
        return;
      }
      
      // If we get here, email doesn't exist
      await signUp(email, password, name);
      toast.success("Account created successfully!");
      
      // Redirect to profile setup page after successful registration
      navigate("/profile-setup");
    } catch (error: any) {
      // Check if error is about duplicate email
      if (error.message?.toLowerCase().includes('email') && error.message?.toLowerCase().includes('already')) {
        toast.error("Email already in use. Please use a different email address.");
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (user) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="hilite-card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-hilite-dark-red">Hi-lite</h1>
            <p className="text-muted-foreground">Create a new account</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="hilite-input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  School Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="hilite-input w-full"
                  placeholder="you@school.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="hilite-input w-full"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="hilite-btn-primary w-full"
                  disabled={isLoading || isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-hilite-dark-red hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
