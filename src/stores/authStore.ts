import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  loadProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      loadProfile: async (userId: string) => {
        const { data } = await supabase
          .from('fisio_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (data) set({ profile: data as Profile });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
      },

      hasRole: (...roles: UserRole[]) => {
        const profile = get().profile;
        return profile ? roles.includes(profile.role) : false;
      },

      isAdmin: () => get().profile?.role === 'admin',
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, profile: s.profile }) }
  )
);
