import type { Metadata } from "next";
import { Lora, Noto_Serif, Noto_Serif_KR } from "next/font/google";
import { Great_Vibes } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gallery",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  variable: "--font-wedding",
});

const koreanSerif = Noto_Serif_KR({
  weight: ["400", "600"], subsets: ["latin"], variable: "--font-wedding-ko", display: "swap", preload: false,
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-invitation",
  display: "swap",
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
      <body className={`${notoSerif.variable} ${koreanSerif.variable} ${lora.variable} ${greatVibes.variable}`}>
        <div className="site-frame">{children}</div>
      </body>
    </html>
  );
}

