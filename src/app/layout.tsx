import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SplitPay Store",
  description: "Shop smarter. Pay flexibly with SplitPay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full bg-store-bg font-sans text-dark-900 antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
