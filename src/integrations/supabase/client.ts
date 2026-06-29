import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const SUPABASE_PROJECT_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://ferlzxkdmbxfisdcwcrl.supabase.co';

export const SUPABASE_PROJECT_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcmx6eGtkbWJ4ZmlzZGN3Y3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDg3MTAsImV4cCI6MjA5Njc4NDcxMH0.Wr6Gt6Uc4owdFH5EzUmgvdypWWfjaC6oB7SpFMhcuy4';

export const supabase = createClient<Database>(SUPABASE_PROJECT_URL, SUPABASE_PROJECT_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});