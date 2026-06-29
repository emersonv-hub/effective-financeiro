import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks garantem funcionamento mesmo quando Lovable
// sobrescreve integrations/supabase/client.ts com sua versao propria
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_URL as string | undefined) ||
  'https://ferlzxkdmbxfisdcwcrl.supabase.co';

const supabaseKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcmx6eGtkbWJ4ZmlzZGN3Y3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDg3MTAsImV4cCI6MjA5Njc4NDcxMH0.Wr6Gt6Uc4owdFH5EzUmgvdypWWfjaC6oB7SpFMhcuy4';

export const supabaseMisconfigured =
  !supabaseUrl || supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
