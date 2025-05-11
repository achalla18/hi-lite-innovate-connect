
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
  projects: string | null;
  awards: string | null;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      setIsLoading(true);
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }
      
      // Set up auth listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, updatedSession) => {
          setSession(updatedSession);
          setUser(updatedSession?.user || null);
          
          if (updatedSession?.user) {
            await fetchProfile(updatedSession.user.id);
          } else {
            setProfile(null);
          }
        }
      );
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    }
    
    getSession();
  }, []);
  
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url, location, about, projects, awards')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };
  
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    setUser(data.user);
    setSession(data.session);
    
    if (data.user) {
      await fetchProfile(data.user.id);
    }
  };
  
  const signUp = async (email: string, password: string, name: string) => {
    // Check if email already exists
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user?.id)
      .single();
    
    if (existingUsers) {
      throw new Error('Email already in use');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    // The profile will be created automatically via a database trigger
    
    // Return the user and session
    setUser(data.user);
    setSession(data.session);
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      signIn, 
      signUp,
      signOut, 
      refreshProfile, 
      isLoading 
    }}>
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
