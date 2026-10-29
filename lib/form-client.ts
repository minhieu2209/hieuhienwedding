import type { Copy } from "@/data/invitations";
export function formError(copy: Copy, code?: string) {
  if (code === "limited") return copy.labels.limited;
  if (code === "invalid_guest") return copy.labels.invalidLink;
  if (code === "invalid_form") return copy.labels.invalidForm;
  if (code === "unavailable" || code === "not_found") return copy.labels.rsvpUnavailable;
  return copy.labels.submitError;
}
export async function sendForm(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "unavailable");
  return result;
}
