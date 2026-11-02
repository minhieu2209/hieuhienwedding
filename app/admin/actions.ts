"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminCookie, adminEmails, currentAdmin } from "@/lib/server/admin";
import { getDatabase } from "@/lib/server/database";

const attempts = new Map<string, { count: number; until: number }>();
export async function login(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 100) ?? "unknown";
  const now = Date.now();
  for (const [key, attempt] of attempts) if (attempt.until < now) attempts.delete(key);
  const attempt = attempts.get(ip) ?? { count: 0, until: now + 600_000 };
  if (attempt.count >= 8 || attempts.size >= 10000) redirect("/admin/login?error=limited");
  attempt.count++; attempts.set(ip, attempt);
  const db = getDatabase();
  if (!db || email.length > 254 || password.length > 256 || !password || !adminEmails().includes(email)) redirect("/admin/login?error=login");
  // getDatabase creates a fresh client; the authenticated session is never reused
  // as the service-role client that reads or moderates the guestbook.
  let session;
  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (!error && data.user?.email_confirmed_at && data.user.email?.toLowerCase() === email) session = data.session;
  } catch { /* Show the same error for all unsuccessful logins. */ }
  if (!session) redirect("/admin/login?error=login");
  attempts.delete(ip);
  (await cookies()).set(adminCookie, session.access_token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin",
    maxAge: Math.min(session.expires_in ?? 3600, 3600),
  });
  redirect("/admin/wishes");
}
export async function logout() {
  (await cookies()).set(adminCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}
export async function moderate(form: FormData) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!/^\d{1,20}$/.test(id) || !["approved", "rejected", "pending"].includes(status)) redirect("/admin/wishes?error=invalid");
  const { error, data } = await admin.db.from("wedding_wishes").update({ moderation_status: status, reviewed_at: status === "pending" ? null : new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (error || !data) redirect("/admin/wishes?error=save");
  revalidatePath("/admin/wishes");
}
