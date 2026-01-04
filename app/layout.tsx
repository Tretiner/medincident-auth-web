import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Путь должен быть правильным!
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "MedSafety",
  description: "App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={cn("min-h-screen bg-brand-bg", inter.className)}>
        {children}
      </body>
    </html>
  );
}