
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | MedSafety',
    default: 'MedSafety',
  },
  description: "Вход в медицинскую систему",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={cn(
         "min-h-screen bg-brand-bg antialiased",
         GeistSans.variable,
         GeistMono.variable,
      )}>
        {children}
      </body>
    </html>
  );
}