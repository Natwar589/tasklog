import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isValid = !!(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseServiceKey.startsWith("eyJ")
);

if (!isValid) {
  console.warn("Backend warning: Supabase credentials are missing or invalid placeholders. Operating in local Sandbox mode.");
}

export const supabase = isValid
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
