import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionsStore } from '@/stores/permissionsStore';

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, loadProfile, signOut, hasRole, isAdmin } = useAuthStore();

  useEffect(() => {
    const { load: loadPerms } = usePermissionsStore.getState();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        loadProfile(session.user.id).finally(() => { setLoading(false); loadPerms(); });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, signOut, hasRole, isAdmin };
}
