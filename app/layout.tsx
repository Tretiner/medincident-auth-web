import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased bg-brand-bg">
        {children}
      </body>
    </html>
  );
}