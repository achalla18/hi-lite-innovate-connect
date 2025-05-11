
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast.success("Password reset instructions have been sent to your email");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="hilite-card">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-hilite-dark-red">Hi-lite</h1>
            {!isSubmitted ? (
              <p className="text-muted-foreground">Reset your password</p>
            ) : (
              <p className="text-muted-foreground">Check your email</p>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="you@school.com"
                    required
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    className="hilite-btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p>
                If an account exists with this email, we've sent password reset instructions.
              </p>
              <p className="text-sm text-muted-foreground">
                Be sure to check your spam folder if you don't see it.
              </p>
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
