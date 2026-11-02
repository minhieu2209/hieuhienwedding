import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/server/admin";
import { logout, moderate } from "../actions";
const statuses = { pending: "Chờ duyệt", approved: "Đã hiển thị", rejected: "Đã ẩn" };
type Status = keyof typeof statuses;
export default async function WishesAdmin({ searchParams }: { searchParams: Promise<{ status?: string; cursor?: string; error?: string }> }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const params = await searchParams;
  const status: Status = params.status && Object.hasOwn(statuses, params.status) ? params.status as Status : "pending";
  let query = admin.db.from("wedding_wishes").select("id,guest_name,message,created_at,moderation_status,host_side").eq("moderation_status", status).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(31);
  if (params.cursor) {
    try {
      if (params.cursor.length > 200) throw new Error();
      const cursor = JSON.parse(Buffer.from(params.cursor, "base64url").toString());
      if (!/^\d{1,20}$/.test(String(cursor.id)) || !Number.isFinite(Date.parse(cursor.time))) throw new Error();
      const time = new Date(cursor.time).toISOString();
      query = query.or(`created_at.lt.${time},and(created_at.eq.${time},id.lt.${cursor.id})`);
    } catch { redirect("/admin/wishes"); }
  }
  const { data, error } = await query;
  const wishes = data?.slice(0, 30) ?? [];
  const last = wishes.at(-1);
  const next = data && data.length > 30 && last ? Buffer.from(JSON.stringify({ time: last.created_at, id: String(last.id) })).toString("base64url") : null;
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-wedding text-3xl text-[var(--wedding-primary-dark)]">Sổ lưu bút chung</h1><p className="mt-3 text-sm text-[var(--wedding-text-muted)]">Chỉ lời chúc được duyệt mới xuất hiện trên các thiệp.</p></div>
      <form action={logout}><button className="rounded-full border border-[var(--wedding-primary-light)] px-4 py-2 text-sm">Đăng xuất</button></form>
    </div>
    <nav aria-label="Lọc lời chúc" className="my-8 flex flex-wrap gap-2">{Object.entries(statuses).map(([key, label]) => <Link key={key} href={`/admin/wishes?status=${key}`} aria-current={key === status ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm ${key === status ? "bg-[var(--wedding-primary-dark)] text-white" : "border-[var(--wedding-primary-light)]"}`}>{label}</Link>)}</nav>
    {(error || params.error) && <p role="alert" className="mb-6 rounded-xl border border-red-200 p-4 text-sm text-red-800">Chưa tải hoặc cập nhật được lời chúc. Vui lòng kiểm tra kết nối và thử lại.</p>}
    {!error && wishes.length === 0 && <p className="rounded-2xl border border-[var(--wedding-primary-light)] p-8 text-center text-[var(--wedding-text-muted)]">Không có lời chúc trong mục này.</p>}
    <div className="space-y-5">{wishes.map(wish => <article key={wish.id} className="rounded-2xl border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] p-6">
      <p className="font-wedding text-xl text-[var(--wedding-primary-dark)]">{wish.guest_name}</p>
      <p className="mt-2 text-xs text-[var(--wedding-text-muted)]">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(wish.created_at))}</p>
      <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7">{wish.message}</p>
      <form action={moderate} className="mt-6 flex flex-wrap gap-3">
        <input type="hidden" name="id" value={String(wish.id)} />
        {status !== "approved" && <button name="status" value="approved" className="rounded-full bg-[var(--wedding-primary-dark)] px-5 py-2 text-sm text-white">Duyệt hiển thị</button>}
        {status !== "rejected" && <button name="status" value="rejected" className="rounded-full border border-[var(--wedding-primary-light)] px-5 py-2 text-sm">Ẩn lời chúc</button>}
        {status !== "pending" && <button name="status" value="pending" className="rounded-full border border-[var(--wedding-primary-light)] px-5 py-2 text-sm">Chuyển chờ duyệt</button>}
      </form>
    </article>)}</div>
    {next && <Link className="mt-8 inline-block underline" href={`/admin/wishes?status=${status}&cursor=${next}`}>Trang tiếp theo →</Link>}
  </>;
}
