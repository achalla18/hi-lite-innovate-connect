import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect URL from the location state or default to home
  const from = location.state?.from?.pathname || "/";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await signIn(email, password);
      toast.success("Signed in successfully!");
      
      // Navigate to the page the user was trying to access, or home
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(`Sign in failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="border-hilite-dark-red/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-hilite-dark-red" />
              <span className="text-2xl font-bold text-hilite-dark-red">Hi-lite</span>
            </div>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-hilite-dark-red hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-hilite-dark-red hover:bg-hilite-dark-red/90"
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            
            <SocialLoginButtons mode="login" />
            
            <div className="mt-6 text-center text-sm">
              <span>Don't have an account? </span>
              <Link to="/register" className="text-hilite-dark-red hover:underline">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}