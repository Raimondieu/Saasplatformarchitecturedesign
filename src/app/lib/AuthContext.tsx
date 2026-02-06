import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'Admin' | 'DataCollector' | 'Reviewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  global_role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  globalRole: UserRole | null;
  isGlobalAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn('Timeout raggiunto, uso fallback');
      resolve(fallback);
    }, ms))
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('fetchProfile per userId:', userId);
    try {
      // METODO 1: RPC get_my_profile (bypassa RLS, no ricorsione)
      const rpcResult = await withTimeout(
        supabase.rpc('get_my_profile'),
        5000,
        { data: null, error: { message: 'Timeout RPC' } } as any
      );
      console.log('RPC get_my_profile result:', JSON.stringify(rpcResult));

      if (rpcResult.data && !rpcResult.error) {
        const p = rpcResult.data as any;
        console.log('Profilo via RPC:', p);
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          global_role: p.global_role || p.role || 'DataCollector',
          created_at: p.created_at,
        };
      }

      // METODO 2: Fallback query diretta (potrebbe fallire per RLS)
      console.log('RPC fallita, provo query diretta...');
      const queryResult = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        5000,
        { data: null, error: { message: 'Timeout query' } } as any
      );
      console.log('Query diretta result:', JSON.stringify(queryResult));

      if (queryResult.data && !queryResult.error) {
        const p = queryResult.data as any;
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          global_role: p.global_role || p.role || 'DataCollector',
          created_at: p.created_at,
        };
      }

      // METODO 3: Fallback minimo con i dati dell'auth user
      console.warn('Entrambi i metodi falliti, uso dati auth come fallback');
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        return {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || null,
          global_role: 'DataCollector', // fallback sicuro
          created_at: authUser.created_at || '',
        };
      }

      return null;
    } catch (err) {
      console.error('Errore imprevisto profilo:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (s?.user) {
          setSession(s); setUser(s.user);
          const p = await fetchProfile(s.user.id);
          if (mounted) setProfile(p);
        }
      } catch (err) { console.error('Errore init auth:', err); }
      finally { if (mounted) setLoading(false); }
    };
    const safety = setTimeout(() => { if (mounted) setLoading(false); }, 8000);
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, ns) => {
      if (!mounted) return;
      setSession(ns); setUser(ns?.user ?? null);
      if (ns?.user) { const p = await fetchProfile(ns.user.id); if (mounted) setProfile(p); }
      else setProfile(null);
    });
    return () => { mounted = false; clearTimeout(safety); subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) return { error: 'Email o password non corretti.' };
        if (error.message.includes('Email not confirmed')) return { error: 'Email non ancora confermata.' };
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) { return { error: err.message || 'Errore imprevisto.' }; }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName || '' } } });
      if (error) {
        if (error.message.includes('already registered')) return { error: 'Email gia registrata.' };
        if (error.message.includes('password')) return { error: 'Password: almeno 6 caratteri.' };
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) { return { error: err.message || 'Errore imprevisto.' }; }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setProfile(null);
  };

  const globalRole = profile?.global_role ?? null;

  return (
    <AuthContext.Provider value={{
      user, session, profile,
      globalRole,
      isGlobalAdmin: globalRole === 'Admin',
      loading, signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve essere usato dentro un <AuthProvider>');
  return context;
}
