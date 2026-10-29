import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

// Preview deployments may not have database configuration yet. Keep the
// invitation readable and let the forms report that submission is unavailable.
function createSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) return null;

  try {
    return createClient(supabaseUrl, supabasePublishableKey);
  } catch {
    return null;
  }
}

export const supabase = createSupabaseClient();
