
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-hilite-dark-red" />
              <span className="text-2xl font-bold text-hilite-dark-red">Hi-lite</span>
            </div>
            <CardTitle>Registration Closed</CardTitle>
            <CardDescription>
              Hi-lite is currently invite-only. Registration is temporarily unavailable.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We're working hard to bring you the best social platform for innovators. 
              Stay tuned for updates on when registration will reopen.
            </p>
            
            <div className="space-y-2">
              <Link to="/login" className="block text-hilite-dark-red hover:underline">
                Already have an account? Sign in
              </Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:underline">
                Return to homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
