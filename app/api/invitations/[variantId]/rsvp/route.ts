import { apiError, submit } from "@/lib/server/submissions";
export async function POST(request: Request, { params }: { params: Promise<{ variantId: string }> }) {
  try { return await submit(request, (await params).variantId, "rsvp"); }
  catch (error) { return apiError(error); }
}
