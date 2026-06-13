"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'client' | 'user' | 'banned' | null;
  avatarSignedUrl: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  avatarSignedUrl: null,
  loading: true,
  signOut: async () => {},
  refreshAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'client' | 'user' | 'banned' | null>(null);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfileData = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, avatar_url')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        if (mounted) setRole(data.role as 'admin' | 'client' | 'user' | 'banned');

        if (data.avatar_url && mounted) {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_url, 3600); // 1 hour expiry
            
          if (urlData) {
            setAvatarSignedUrl(urlData.signedUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (mounted) setRole('client'); // Default fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const initializeAuth = async () => {
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
          setRole(null);
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
  };

  return (
    <AuthContext.Provider value={{ user, session, role, avatarSignedUrl, loading, signOut, refreshAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
