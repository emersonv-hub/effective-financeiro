import { createClient } from '@supabase/supabase-js';
import { supabase as _typedClient } from '@/integrations/supabase/client';

// Read URL/key from the typed client (handles both env vars and Lovable hardcoded values)
const _c = _typedClient as any;
const clientUrl: string = _c.supabaseUrl ?? '';
const clientKey: string = _c.supabaseKey ?? '';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || clientUrl;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  clientKey;

export const supabaseMisconfigured =
  !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseAnonKey;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  { auth: { persistSession: true, autoRefreshToken: true } },
);
