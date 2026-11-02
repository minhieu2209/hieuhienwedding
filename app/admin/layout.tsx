import type { Metadata } from "next";
export const metadata: Metadata = { title: "Quản lý sổ lưu bút", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main lang="vi" className="min-h-screen bg-[var(--wedding-bg)] px-5 py-12 md:px-10">{children}</main>;
}
