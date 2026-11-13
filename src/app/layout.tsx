import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maisha - Kids 3D Gaming Arcade",
  description: "বাচ্চাদের জন্য ৩ডি গেমস, শেখা ও আনন্দের নিরাপদ প্ল্যাটফর্ম",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
