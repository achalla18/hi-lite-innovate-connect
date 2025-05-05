
import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="py-4 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-hilite-purple">Hi-Lite</span>
        </Link>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Hi-Lite. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link to="/about" className="hover:text-hilite-purple">About</Link>
          <Link to="/privacy" className="hover:text-hilite-purple">Privacy</Link>
          <Link to="/terms" className="hover:text-hilite-purple">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
