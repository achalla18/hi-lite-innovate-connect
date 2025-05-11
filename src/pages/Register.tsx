
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
      
      // We'll simplify the check to avoid deep instantiation errors
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
