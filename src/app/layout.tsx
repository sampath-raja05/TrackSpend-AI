import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "TrackSpend AI | AI Spend Audit & Optimization",
  description: "Optimize your AI tooling spend without sacrificing team productivity. Professional auditing for engineering leaders.",
  openGraph: {
    title: "TrackSpend AI | AI Spend Audit & Optimization",
    description: "Find unused seats, overpriced AI plans, and realistic monthly savings in minutes.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackSpend AI | AI Spend Audit & Optimization",
    description: "Find unused seats, overpriced AI plans, and realistic monthly savings in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
