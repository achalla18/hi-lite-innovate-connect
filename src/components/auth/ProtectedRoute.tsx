import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerified?: boolean;
}

export default function ProtectedRoute({ children, requireVerified = false }: ProtectedRouteProps) {
  const { user, isLoading, isEmailVerified } = useAuth();
  const location = useLocation();
  
  // Record the last visited protected route for redirect after login
  useEffect(() => {
    if (!user && !isLoading) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
  }, [user, isLoading, location]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-hilite-dark-red border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If email verification is required and user's email is not verified
  if (requireVerified && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return <>{children}</>;
}