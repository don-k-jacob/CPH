import type { Metadata } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Catholic Product Hunt",
  description: "A Catholic community for discovering and launching products that serve real people."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
        <Header />
        <main className="container py-4 md:py-10">
          <div className="page-frame">{children}</div>
        </main>
        <footer className="container pb-8 pt-2 text-center text-xs text-black/55">
          <p>Build products with truth, beauty, and service.</p>
        </footer>
      </body>
    </html>
  );
}
