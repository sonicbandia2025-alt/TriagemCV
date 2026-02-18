interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Augment the global NodeJS namespace to include API_KEY in ProcessEnv.
// This ensures compatibility with both Node.js environment (vite.config.ts) and frontend code where @types/node is available,
// without shadowing the global 'process' variable which causes "cwd" missing errors.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
