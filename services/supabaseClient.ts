import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO AUTOMÁTICA ---
// Default fallbacks maintained but Env Vars via Vite take precedence
const DEFAULT_URL = 'https://npjodvblunmbdtkbndsq.supabase.co';
// Keeping the default key here as fallback if env var is missing during dev
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wam9kdmJsdW5tYmR0a2JuZHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzMzMTUsImV4cCI6MjA4Njc0OTMxNX0.upBjW5lXz4wRjd9r716rYlJOjWoNwqwq_lmB-6SDwgw';

// Permite sobrescrever via LocalStorage se necessário (painel de config)
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

// Safe access helper for import.meta.env
const getEnv = (key: string) => {
  try {
    return import.meta.env?.[key];
  } catch (e) {
    return undefined;
  }
};

// Prioridade: VITE_ENV > LocalStorage > Hardcoded Default
export const supabaseUrl = getEnv('VITE_SUPABASE_URL') || storedUrl || DEFAULT_URL;
export const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || storedKey || DEFAULT_KEY;

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.includes('supabase.co');
};

if (!isSupabaseConfigured()) {
  console.warn("⚠️ Supabase Credentials Missing! Please configure them in the UI or Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);