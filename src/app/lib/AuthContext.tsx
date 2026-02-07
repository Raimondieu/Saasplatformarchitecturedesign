import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseConfig } from './supabase';
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
  refreshProfile: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_KEY = 'esrs_profile';

// =====================================================
// Fetch profilo via REST puro (NESSUN AbortSignal, NESSUN client Supabase)
// =====================================================
async function fetchProfileREST(accessToken: string, userId: string): Promise<UserProfile | null> {
  const { url, anonKey } = getSupabaseConfig();
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Tentativo 1: RPC get_my_profile
  try {
    const r = await fetch(`${url}/rest/v1/rpc/get_my_profile`, { method: 'POST', headers, body: '{}' });
    if (r.ok) {
      const d = await r.json();
      if (d && d.id) return toProfile(d);
    }
  } catch (_) {}

  // Tentativo 2: GET profiles
  try {
    const r = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers: { ...headers, Accept: 'application/json' }, method: 'GET' });
    if (r.ok) {
      const arr = await r.json();
      if (Array.isArray(arr) && arr[0]) return toProfile(arr[0]);
    }
  } catch (_) {}

  return null;
}

function toProfile(p: any): UserProfile {
  return {
    id: p.id,
    email: p.email || '',
    full_name: p.full_name || null,
    global_role: (p.global_role || p.role || 'DataCollector') as UserRole,
    created_at: p.created_at || '',
  };
}

function saveCache(userId: string, p: UserProfile) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ uid: userId, p, t: Date.now() })); } catch (_) {}
}
function loadCache(userId: string): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { uid, p, t } = JSON.parse(raw);
    if (uid !== userId || Date.now() - t > 300000) return null; // 5 min TTL
    return p;
  } catch { return null; }
}
function clearCache() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {}
}

// =====================================================
// Provider
// =====================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carica profilo: usa cache subito, poi aggiorna in background
  const loadProfile = useCallback(async (s: Session) => {
    const uid = s.user.id;

    // Cache immediata
    const cached = loadCache(uid);
    if (cached) setProfile(cached);

    // Fetch da rete
    const fresh = await fetchProfileREST(s.access_token, uid);
    if (fresh) {
      setProfile(fresh);
      saveCache(uid, fresh);
    } else if (!cached) {
      // Se nessun profilo e nessuna cache, usiamo i dati minimi dell'auth user
      setProfile({
        id: uid,
        email: s.user.email || '',
        full_name: s.user.user_metadata?.full_name || null,
        global_role: 'DataCollector',
        created_at: s.user.created_at || '',
      });
    }
  }, []);

  useEffect(() => {
    let active = true;

    // 1. Leggi sessione
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!active) return;
      if (s) {
        setSession(s);
        setUser(s.user);
        loadProfile(s).finally(() => { if (active) setLoading(false); });
      } else {
        setLoading(false);
      }
    });

    // 2. Ascolta cambi di stato auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      if (!active) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s) {
        loadProfile(s).finally(() => { if (active) setLoading(false); });
      } else {
        setProfile(null);
        clearCache();
        setLoading(false);
      }
    });

    // Safety: dopo 4 secondi sblocca sempre
    const t = setTimeout(() => { if (active) setLoading(false); }, 4000);

    return () => { active = false; clearTimeout(t); subscription.unsubscribe(); };
  }, [loadProfile]);

  // ---- Azioni ----

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return { error: 'Email o password non corretti.' };
      if (error.message.includes('Email not confirmed')) return { error: 'Email non ancora confermata.' };
      return { error: error.message };
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName || '' } } });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    clearCache();
    setUser(null);
    setSession(null);
    setProfile(null);
    await supabase.auth.signOut();
    // Forza un reload pulito
    window.location.href = window.location.origin;
  };

  const refreshProfile = async (): Promise<boolean> => {
    if (!session) return false;
    const p = await fetchProfileREST(session.access_token, session.user.id);
    if (p) {
      setProfile(p);
      saveCache(session.user.id, p);
      return true;
    }
    return false;
  };

  const globalRole = profile?.global_role ?? null;

  return (
    <AuthContext.Provider value={{
      user, session, profile, globalRole,
      isGlobalAdmin: globalRole === 'Admin',
      loading, signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuori da AuthProvider');
  return ctx;
}
