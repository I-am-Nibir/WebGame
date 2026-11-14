import type { Metadata, Viewport } from "next";
import "./globals.css";
import LangInit from "@/components/ui/LangInit";

export const metadata: Metadata = {
  title: "Maisha - Kids 3D Gaming Arcade",
  description: "Safe 3D games for kids — play, learn and have fun! | বাচ্চাদের জন্য ৩ডি গেমস, শেখা ও আনন্দের নিরাপদ প্ল্যাটফর্ম",
  applicationName: "Maisha Arcade",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="antialiased">
        <LangInit />
        {children}
      </body>
    </html>
  );
}
