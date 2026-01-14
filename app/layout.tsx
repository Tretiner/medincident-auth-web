// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";
import { ThemeProvider } from "../components/ui/theme-provider";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: "Вход в медицинскую систему",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="smooth-scroll"
      lang="ru"
      suppressHydrationWarning
    >
      <body className="bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="root"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}