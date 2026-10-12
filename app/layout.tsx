import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  variable: "--font-wedding",
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
      <body className={notoSerif.variable}>{children}</body>
    </html>
  );
}