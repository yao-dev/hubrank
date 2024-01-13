
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || ""
)

export const supabaseAdmin = (adminKey: string) => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  adminKey
)

export default supabase;