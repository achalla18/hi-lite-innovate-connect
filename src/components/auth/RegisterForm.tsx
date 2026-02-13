import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { registerSchema } from "@/lib/authValidation";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const parsed = registerSchema.safeParse({
        name,
        email,
        password,
        confirmPassword,
        acceptedTerms,
      });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || "Please check your inputs");
        return;
      }

      if (!isPasswordStrong) {
        toast.error("Please choose a stronger password before signing up");
        return;
      }

      await signUp(parsed.data.email, parsed.data.password, parsed.data.name);
      toast.success("Registration successful! Please verify your email to continue.");
      navigate("/profile-setup");
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground mt-2">
          Join Hi-Lite, the social network for tomorrow's innovators
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <PasswordStrengthIndicator password={password} onStrengthChange={setIsPasswordStrong} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="accept-terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
          />
          <Label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            By creating an account, you agree to our <Link to="/terms" className="underline underline-offset-2">Terms of Service</Link> and <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-hilite-dark-red hover:bg-hilite-dark-red/90"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span>Already have an account? </span>
        <Link to="/login" className="hilite-link">
          Log in
        </Link>
      </div>
    </div>
  );
}
