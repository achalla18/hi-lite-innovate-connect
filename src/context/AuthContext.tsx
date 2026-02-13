import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  location: string | null;
  about: string | null;
  experience: string | null;
  projects: string | null;
  awards: string | null;
  profile_completed: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
  isEmailVerified: boolean;
  hasTwoFactorEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [hasTwoFactorEnabled, setHasTwoFactorEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        setIsLoading(true);
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            setIsEmailVerified(!!currentSession.user.email_confirmed_at);
            await fetchProfile(currentSession.user.id);
            await checkTwoFactorStatus(currentSession.user.id);
          }
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, updatedSession) => {
          if (!mounted) return;

          setSession(updatedSession);
          setUser(updatedSession?.user || null);

          if (updatedSession?.user) {
            setIsEmailVerified(!!updatedSession.user.email_confirmed_at);
            await fetchProfile(updatedSession.user.id);
            await checkTwoFactorStatus(updatedSession.user.id);
          } else {
            setProfile(null);
            setIsEmailVerified(false);
            setHasTwoFactorEnabled(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    getSession();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, avatar_url, location, about, projects, awards, experience, profile_completed")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const checkTwoFactorStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("two_factor_enabled")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking 2FA status:", error);
        return;
      }

      setHasTwoFactorEnabled(data?.two_factor_enabled || false);
    } catch (error) {
      console.error("2FA status check error:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    setUser(data.user);
    setSession(data.session);
    setIsEmailVerified(!!data.user?.email_confirmed_at);

    if (data.user) {
      await fetchProfile(data.user.id);
      await checkTwoFactorStatus(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: cleanName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    setUser(data.user);
    setSession(data.session);
    setIsEmailVerified(!!data.user?.email_confirmed_at);

    if (data.user) {
      await fetchProfile(data.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsEmailVerified(false);
    setHasTwoFactorEnabled(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isLoading,
        isEmailVerified,
        hasTwoFactorEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
