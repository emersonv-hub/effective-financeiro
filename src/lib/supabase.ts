import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PROJECT_URL, SUPABASE_PROJECT_KEY } from '@/integrations/supabase/client';

// Exported constants are safe against minification in production builds
export const supabaseMisconfigured =
  !SUPABASE_PROJECT_URL ||
  SUPABASE_PROJECT_URL.includes('placeholder') ||
  !SUPABASE_PROJECT_KEY ||
  SUPABASE_PROJECT_KEY.includes('placeholder');

// Untyped client used by app business logic — avoids strict DB type conflicts
// Uses same URL/key as the typed client, so sessions are shared via localStorage
export const supabase = createClient(
  SUPABASE_PROJECT_URL || 'https://placeholder.supabase.co',
  SUPABASE_PROJECT_KEY || 'placeholder',
  { auth: { persistSession: true, autoRefreshToken: true } },
);
