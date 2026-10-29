import type { Metadata } from "next";
import { Noto_Serif, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  variable: "--font-wedding",
});

const koreanSerif = Noto_Serif_KR({
  weight: ["400", "600"], subsets: ["latin"], variable: "--font-wedding-ko", display: "swap", preload: false,
});

export const metadata: Metadata = {
  title: "Wedding Invitation",
  description: "Wedding Invitation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${notoSerif.variable} ${koreanSerif.variable}`}>{children}</body>
    </html>
  );
}