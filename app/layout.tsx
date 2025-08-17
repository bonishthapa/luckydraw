import type React from "react";
import type { Metadata } from "next";
import { Work_Sans, Open_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Lucky Draw Management Dashboard",
  description:
    "Professional dashboard for managing lucky draws and bumper prizes",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer theme="colored" />
      </body>
    </html>
  );
}
