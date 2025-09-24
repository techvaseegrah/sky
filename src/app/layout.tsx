import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'; // <-- 1. Import the Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sky Bar",
  description: "Management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" /> {/* <-- 2. Add the component here */}
      </body>
    </html>
  );
}