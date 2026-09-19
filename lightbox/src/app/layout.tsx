import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "光匣 LightBox - 在线影视",
  description: "光匣 - 为 Aurora 打造的流媒体观影体验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted)]">
          光匣 LightBox · 请支持购买正版
        </footer>
      </body>
    </html>
  );
}
