import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maisha - Kids 3D Gaming Arcade",
  description: "বাচ্চাদের জন্য ৩ডি গেমস, শেখা ও আনন্দের ফুল-স্ট্যাক প্ল্যাটফর্ম",
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
