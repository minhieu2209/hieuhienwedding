import { redirect } from "next/navigation";
import { currentAdmin, adminEmails } from "@/lib/server/admin";
import { getDatabase } from "@/lib/server/database";
import { login } from "../actions";
import LoginButton from "@/components/admin/LoginButton";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect("/admin/wishes");
  const { error } = await searchParams;
  const configured = adminEmails().length > 0 && Boolean(getDatabase());
  const field = "mt-2 w-full rounded-xl border border-[var(--wedding-primary-light)] bg-white px-4 py-3 outline-offset-4";
  return <div className="mx-auto max-w-md rounded-[28px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] p-7 md:mt-16 md:p-10">
    <p className="text-xs uppercase tracking-widest text-[var(--wedding-primary)]">Minh Hiếu & Thu Hiền</p>
    <h1 className="mt-4 font-wedding text-3xl text-[var(--wedding-primary-dark)]">Duyệt lời chúc</h1>
    <p className="mt-4 text-sm leading-7 text-[var(--wedding-text-muted)]">Đăng nhập để xem và chọn lời chúc hiển thị trên sổ lưu bút chung.</p>
    {!configured && <p role="status" className="mt-6 rounded-xl bg-[var(--wedding-surface)] p-4 text-sm leading-6">Trang quản trị chưa được thiết lập. Vui lòng hoàn tất cấu hình tài khoản quản trị.</p>}
    <form action={login} className="mt-7 space-y-5">
      <label className="block text-sm">Email<input name="email" type="email" autoComplete="username" required maxLength={254} className={field} /></label>
      <label className="block text-sm">Mật khẩu<input name="password" type="password" autoComplete="current-password" required maxLength={256} className={field} /></label>
      {error && <p role="alert" className="text-sm text-red-800">{error === "limited" ? "Đã thử đăng nhập nhiều lần. Vui lòng thử lại sau ít phút." : "Chưa đăng nhập được. Vui lòng kiểm tra tài khoản và mật khẩu."}</p>}
      <LoginButton configured={configured} />
    </form>
  </div>;
}
