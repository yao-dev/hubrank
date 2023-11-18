
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || ""
)

export const supabaseAdmin = (adminKey: string) => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  adminKey
)

export default supabase;