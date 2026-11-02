import "server-only";
import { cookies } from "next/headers";
import { getDatabase } from "./database";

export const adminCookie = "wedding_admin_session";
export function adminEmails() {
  return (process.env.WEDDING_ADMIN_EMAILS ?? "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
}
export async function currentAdmin() {
  const token = (await cookies()).get(adminCookie)?.value;
  const db = getDatabase();
  if (!db || !token || token.length > 8192 || !adminEmails().length) return null;
  try {
    // Validate with Supabase Auth on every protected page and every mutation.
    // A cookie or client-supplied email alone never grants administrator access.
    const { data, error } = await db.auth.getUser(token);
    const user = data.user;
    if (error || !user?.email || !user.email_confirmed_at || !adminEmails().includes(user.email.toLowerCase())) return null;
    return { db, user };
  } catch { return null; }
}
