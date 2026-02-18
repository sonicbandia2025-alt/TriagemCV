import { User } from "../types";
import { supabase, supabaseUrl, supabaseAnonKey } from "./supabaseClient";
import { createUserDocument, getUserData } from "./databaseService";
import { createClient } from '@supabase/supabase-js';

type AuthListener = (user: User | null) => void;

class SupabaseAuthService {
  private listeners: AuthListener[] = [];
  private currentUser: User | null = null;

  constructor() {
    // Initialize state
    this.init();
  }

  private async init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.currentUser = await getUserData(session.user.id);
      this.notifyListeners();
    }

    // Listen for changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch full profile data including credits/admin status
        const userData = await getUserData(session.user.id);
        this.currentUser = userData;
      } else {
        this.currentUser = null;
      }
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChanged(callback: AuthListener) {
    this.listeners.push(callback);
    // Fire immediately with current state if known
    if (this.currentUser) callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
         return { success: false, message: "Email não confirmado. Desative 'Confirm Email' no painel do Supabase (Authentication > Providers > Email)." };
      }
      return { success: false, message: "Email ou senha incorretos." };
    }

    return { success: true };
  }

  async logout() {
    await supabase.auth.signOut();
  }

  // NOTE: Uses a temporary client to avoid signing out the current Admin
  async registerUserByAdmin(email: string, password: string, name: string, credits: number): Promise<{ success: boolean; message: string }> {
    
    // 1. Create a temporary Supabase client
    const tempClient = createClient(supabaseUrl, supabaseAnonKey);

    // 2. Create Auth User using the temp client
    const { data, error } = await tempClient.auth.signUp({
      email,
      password,
      options: {
        data: { name } // Metadata
      }
    });

    if (error) {
      console.error("Erro ao criar usuário:", error);
      if (error.message.includes("rate limit")) {
        return { 
          success: false, 
          message: "⚠️ Limite de envio de emails excedido pelo Supabase. Vá em Authentication > Providers > Email e DESATIVE a opção 'Confirm email' para criar usuários sem restrição." 
        };
      }
      if (error.message.includes("already registered")) {
        return { success: false, message: "Este email já está cadastrado." };
      }
      return { success: false, message: `Erro: ${error.message}` };
    }

    if (data.user) {
      // 3. Try to create Profile
      // If data.session exists (Auto Confirm ON), we can insert directly using tempClient (authenticated as new user).
      // If data.session is null (Confirm Email ON), we cannot insert yet (RLS violation). 
      // The profile will be created automatically on first login via databaseService.getUserData logic.

      if (data.session) {
         const { error: profileError } = await tempClient
           .from('profiles')
           .insert({
              id: data.user.id,
              name,
              email,
              is_admin: false,
              max_credits: credits,
              usage_count: 0
           });
         
         if (profileError) {
             console.error("Erro ao criar perfil (temp client):", profileError);
             return { success: true, message: 'Usuário criado, mas houve erro na configuração inicial. O sistema corrigirá no primeiro login.' };
         }
         return { success: true, message: 'Usuário cadastrado com sucesso!' };
      } else {
         return { success: true, message: 'Usuário criado! Necessário confirmar email. Para pular isso, desative "Confirm Email" no Supabase.' };
      }
    }

    return { success: false, message: 'Erro desconhecido na criação.' };
  }

  async createMasterAdmin(): Promise<{ success: boolean; message: string }> {
    // Attempt to create the master admin based on user request.
    const email = 'adm@tri.app';
    const password = 'Antinella-03';

    // We use the main client here because we want to log in as admin anyway
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // If user already exists, we return success so the user can just try to login
      if (error.message.includes("already registered")) {
         return { success: true, message: "Usuário Admin já existe. Tentando preencher login..." };
      }
      return { success: false, message: "Erro: " + error.message };
    }

    if (data.user) {
      // If we have a session, create profile
      if (data.session) {
          await createUserDocument(data.user.id, 'Admin Principal', email, 9999, true);
          return { success: true, message: "Admin criado com sucesso! Clique em Entrar." };
      }
      return { success: true, message: "Conta criada. Verifique seu email se necessário, depois entre." };
    }
    
    return { success: false, message: "Erro ao criar admin." };
  }
}

export const authService = new SupabaseAuthService();