"use client";
import { useFormStatus } from "react-dom";
export default function LoginButton({ configured }: { configured: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending || !configured} className="w-full rounded-full bg-[var(--wedding-primary-dark)] px-6 py-3 text-white disabled:opacity-40">{pending ? "Đang đăng nhập…" : "Đăng nhập"}</button>;
}
