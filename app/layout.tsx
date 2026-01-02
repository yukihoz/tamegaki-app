import type { Metadata } from "next";
import { Geist, Geist_Mono, Shippori_Mincho, Noto_Sans_JP, Yuji_Syuku, Zen_Antique } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

const yujiSyuku = Yuji_Syuku({
  variable: "--font-yuji-syuku",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const zenAntique = Zen_Antique({
  variable: "--font-zen-antique",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: "為書きジェネレーター",
  description: "選挙や応援に使える為書きを簡単に作成・シェアできます。",
  openGraph: {
    title: "為書きジェネレーター",
    description: "選挙や応援に使える為書きを簡単に作成・シェアできます。",
    type: "website",
    locale: "ja_JP",
    images: ["/tamegaki-base.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/tamegaki-base.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${shipporiMincho.variable} ${notoSansJP.variable} ${yujiSyuku.variable} ${zenAntique.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
