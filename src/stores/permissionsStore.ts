import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Módulos sempre visíveis para todos os autenticados
const ALWAYS_ALL   = new Set(['dashboard']);
// Módulos exclusivos do admin (nunca configuráveis para outros)
const ALWAYS_ADMIN = new Set(['configuracoes']);

interface PermissionsState {
  perms: Record<string, Record<string, boolean>>;
  loaded: boolean;
  load: () => Promise<void>;
  update: (module: string, role: string, allowed: boolean) => Promise<void>;
  canAccess: (module: string, userRole: string) => boolean;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  perms: {},
  loaded: false,

  load: async () => {
    const { data } = await supabase.from('module_permissions').select('module, role, allowed');
    const perms: Record<string, Record<string, boolean>> = {};
    for (const row of (data ?? [])) {
      if (!perms[row.module]) perms[row.module] = {};
      perms[row.module][row.role] = row.allowed;
    }
    set({ perms, loaded: true });
  },

  update: async (module, role, allowed) => {
    await supabase
      .from('module_permissions')
      .upsert({ module, role, allowed }, { onConflict: 'module,role' });
    const perms = { ...get().perms };
    if (!perms[module]) perms[module] = {};
    perms[module][role] = allowed;
    set({ perms });
  },

  canAccess: (module, userRole) => {
    if (userRole === 'admin') return true;
    if (ALWAYS_ALL.has(module)) return true;
    if (ALWAYS_ADMIN.has(module)) return false;
    return get().perms[module]?.[userRole] ?? true;
  },
}));
