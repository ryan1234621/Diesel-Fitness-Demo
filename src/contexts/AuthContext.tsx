"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type Profile = {
  role: 'admin' | 'client' | 'user' | 'banned' | null;
  avatar_url?: string | null;
  full_name?: string | null;
  email?: string | null;
  status?: string | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  avatarSignedUrl: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  avatarSignedUrl: null,
  loading: true,
  signOut: async () => {},
  refreshAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfileData = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Supabase error fetching profile:", error);
          if (mounted) setProfile({ role: 'client' });
          return;
        }

        if (!data) {
          if (mounted) setProfile({ role: 'client' });
          return;
        }

        if (mounted) setProfile(data as Profile);

        if (data.avatar_url && mounted) {
          try {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('avatars')
              .createSignedUrl(data.avatar_url, 3600); // 1 hour expiry
              
            if (urlData) {
              setAvatarSignedUrl(urlData.signedUrl);
            }
          } catch (e) {
            console.error("Error creating signed URL:", e);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (mounted) setProfile({ role: 'client' }); // Default fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        if (session?.user) {
          await fetchProfileData(session.user.id);
        } else {
          if (mounted) setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      if (session?.user) {
        await fetchProfileData(session.user.id);
      } else {
        if (mounted) {
          setProfile(null);
          setAvatarSignedUrl(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshAvatar = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
        
      if (data?.avatar_url) {
        const { data: urlData } = await supabase.storage
          .from('avatars')
          .createSignedUrl(data.avatar_url, 3600);
          
        if (urlData) {
          setAvatarSignedUrl(urlData.signedUrl);
        }
      }
    } catch (err) {
      console.error("Error refreshing avatar:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, avatarSignedUrl, loading, signOut, refreshAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
