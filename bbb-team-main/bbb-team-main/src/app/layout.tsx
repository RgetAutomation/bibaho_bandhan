import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/helper/system/theme-provider";
import { ThemeSwitcher } from "@/components/helper/system/theme-switcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bangali Bibaho Bandhan",
    template: "%s | Bangali Bibaho Bandhan",
  },
  description:
    "Bangali Bibaho Bandhan — a Bengali matrimonial platform connecting families.",
  authors: [
    { name: "Bangali Bibaho Bandhan", url: "https://bibahobandhan.com" },
  ],
  creator: "Beta Debug",
  publisher: "Bangali Bibaho Bandhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
