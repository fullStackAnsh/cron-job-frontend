import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// 1. Initialize the font and define the CSS variable name
const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat", // This must match the variable in globals.css
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
      {/* 2. Apply the variable to the body tag along with font-sans */}
      <body className={`${montserrat.variable} font-sans bg-gray-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}