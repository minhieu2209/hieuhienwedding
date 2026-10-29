import { apiError, listWishes, submit } from "@/lib/server/submissions";
type Context = { params: Promise<{ variantId: string }> };
export async function GET(request: Request, { params }: Context) {
  try { return await listWishes(request, (await params).variantId); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request, { params }: Context) {
  try { return await submit(request, (await params).variantId, "wishes"); }
  catch (error) { return apiError(error); }
}
