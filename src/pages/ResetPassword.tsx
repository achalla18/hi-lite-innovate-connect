
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashPresent, setHashPresent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash in the URL (means coming from reset email)
    const hash = window.location.hash;
    setHashPresent(hash.length > 0);

    if (!hash) {
      toast.error("Invalid or expired password reset link");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error: any) {
      toast.error(`Failed to reset password: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="hilite-card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-hilite-dark-red">Hi-lite</h1>
            <p className="text-muted-foreground">Reset your password</p>
          </div>

          {hashPresent ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    className="hilite-btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p>
                This password reset link is invalid or has expired.
              </p>
              <p>
                Please request a new password reset link.
              </p>
              <Button
                asChild
                className="hilite-btn-primary mt-4"
              >
                <Link to="/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-hilite-dark-red hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
