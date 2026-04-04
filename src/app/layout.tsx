import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "えいご絵本リーダー",
  description:
    "絵本をカメラで撮影するだけで、AIがきれいな英語で読み上げてくれるアプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "えほんリーダー",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF7EA8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased`}>
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  );
}
