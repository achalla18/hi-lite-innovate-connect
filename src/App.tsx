import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";
import Premium from "./pages/Premium";
import Network from "./pages/Network";
import Discover from "./pages/Discover";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import AuthCallback from "./pages/AuthCallback";
import AccountSecurity from "./pages/AccountSecurity";
import EmailVerificationBanner from "./components/auth/EmailVerificationBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const FullScreenLoader = () => (
  <div className="flex items-center justify-center h-screen" role="status" aria-live="polite" aria-label="Loading application">
    <div className="animate-spin h-8 w-8 border-4 border-hilite-dark-red border-t-transparent rounded-full" />
  </div>
);

const LegacyClubRouteRedirect = () => {
  const { clubId } = useParams();

  if (!clubId) {
    return <Navigate to="/clubs" replace />;
  }

  return <Navigate to={`/club/${clubId}`} replace />;
};

function AppRoutes() {
  const { user, isLoading, isEmailVerified } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      {user && !isEmailVerified && <EmailVerificationBanner />}

      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/landing" element={!user ? <Landing /> : <Navigate to="/" replace />} />

        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
        <Route path="/club/:clubId" element={<ProtectedRoute><ClubDetail /></ProtectedRoute>} />
        <Route path="/clubs/:clubId" element={<ProtectedRoute><LegacyClubRouteRedirect /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
        <Route path="/company/:companyId" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/hashtag/:tag" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/account/security" element={<ProtectedRoute><AccountSecurity /></ProtectedRoute>} />

        <Route path="/" element={user ? <ProtectedRoute><Index /></ProtectedRoute> : <Landing />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
