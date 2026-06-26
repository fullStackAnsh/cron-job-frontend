import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import MobileNav from "@/components/MobileNav"; // Adjusted import path to match your workspace folder hierarchy

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaaS Cron Scheduler",
  description: "Manage and monitor serverless crons effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans bg-gray-50 text-slate-900 antialiased`}>
        {/* Fixed: Automatically watches pathnames globally and renders selectively */}
        <MobileNav />
        {children}
      </body>
    </html>
  );
}