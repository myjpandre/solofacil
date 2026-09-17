import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE (preparado, ainda não obrigatório)
// Enquanto NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// não são configuradas, o app usa localStorage (ver lib/storage.ts).
// `supabase` fica como `null` nesse caso, em vez de derrubar o app.
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
