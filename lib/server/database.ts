import "server-only";
import { createClient } from "@supabase/supabase-js";

export function getDatabase() {
  if (process.env.WEDDING_DATABASE_ENABLED === "false") return null;
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(6000) }) },
    });
  } catch { return null; }
}
export type Database = NonNullable<ReturnType<typeof getDatabase>>;
export class InvitationError extends Error {
  constructor(public code: string, public status = 503) { super(code); }
}
