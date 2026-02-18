import { AnalysisResult, User } from "../types";
import { supabase } from "./supabaseClient";

// --- SUPABASE DATABASE SERVICE ---

export const createUserDocument = async (uid: string, name: string, email: string, initialCredits: number = 3, isAdmin: boolean = false) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: uid,
      name,
      email,
      is_admin: isAdmin,
      max_credits: initialCredits,
      usage_count: 0
    });

  if (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  // 1. Try to get the profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  // 2. If profile exists, return it
  if (data) {
    return {
      uid: data.id,
      username: data.email,
      name: data.name,
      isAdmin: data.is_admin,
      maxCredits: data.max_credits,
      usageCount: data.usage_count
    };
  }

  // 3. If profile does NOT exist (e.g. user created manually in Supabase Dashboard),
  //    we fetch the user details from Auth and create the profile on the fly.
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && user.id === uid) {
    console.log("Perfil não encontrado. Criando automaticamente...");
    
    // BACKDOOR: If it's the master email, force Admin rights
    const isMasterAdmin = user.email === 'adm@tri.app';
    const initialCredits = isMasterAdmin ? 9999 : 3;
    const name = isMasterAdmin ? 'Admin Principal' : (user.email?.split('@')[0] || 'Novo Usuário');

    await createUserDocument(uid, name, user.email || '', initialCredits, isMasterAdmin);
    
    // Return the newly created user object
    return {
      uid: uid,
      username: user.email || '',
      name: name,
      isAdmin: isMasterAdmin,
      maxCredits: initialCredits,
      usageCount: 0
    };
  }

  if (error) {
    console.error("Error fetching user data:", error);
  }
  return null;
};

export const incrementUserUsage = async (uid: string): Promise<number> => {
  // OPTION A: Try to use a Remote Procedure Call (RPC) if available.
  // This is the safest way to ensure atomic increments and bypass strict RLS if the function is 'security definer'.
  const { data: rpcData, error: rpcError } = await supabase.rpc('increment_usage', { row_id: uid });

  if (!rpcError) {
    // If RPC success, return the new count returned by the function
    return rpcData as number;
  }

  // OPTION B: Fallback to manual read-modify-write if RPC is not set up.
  console.warn("RPC increment_usage not found, falling back to manual update.", rpcError.message);

  // 1. Get current count
  const { data: profile } = await supabase
    .from('profiles')
    .select('usage_count')
    .eq('id', uid)
    .single();

  if (!profile) return 0;

  const newCount = (profile.usage_count || 0) + 1;

  // 2. Update count and SELECT it back to ensure it was written
  const { error } = await supabase
    .from('profiles')
    .update({ usage_count: newCount })
    .eq('id', uid)
    .select()
    .single();

  if (error) {
    console.error("Error incrementing usage manually:", error);
    // Return old count to prevent UI desync (better to show old credit than fake new one)
    return profile.usage_count;
  }

  return newCount;
};

export const saveAnalysisResult = async (uid: string, candidateName: string, jobTitle: string, result: AnalysisResult) => {
  const { error } = await supabase
    .from('analyses')
    .insert({
      user_id: uid,
      candidate_name: candidateName,
      job_title: jobTitle,
      result: result // Supabase handles JSONB automatically
    });

  if (error) {
    console.error("Error saving analysis:", error);
  }
};

// --- ADMIN FUNCTIONS ---

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('is_admin', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all users:", error);
    return [];
  }

  return data.map((u: any) => ({
    uid: u.id,
    username: u.email,
    name: u.name,
    isAdmin: u.is_admin,
    maxCredits: u.max_credits,
    usageCount: u.usage_count
  }));
};

export const updateUserCredits = async (uid: string, newLimit: number) => {
  const { error } = await supabase
    .from('profiles')
    .update({ max_credits: newLimit })
    .eq('id', uid);

  if (error) {
    throw new Error(error.message);
  }
};