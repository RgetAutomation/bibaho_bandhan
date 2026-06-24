export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/system/theme-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { ModeToggle } from "@/components/system/theme-switcher";
import { QueryProviders } from "@/components/system/queryClientProvider";
import BroadcastModal from "@/components/BroadcastModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
  keywords: [
    "Bangali Bibaho Bandhan",
    "Bengali matrimonial",
    "Bengali marriage",
    "matrimonial site",
    "matchmaking",
    "ghotok",
    "Bengali bride",
    "Bengali groom",
    "shaadi",
    "marriage",
  ],
  authors: [
    { name: "Bangali Bibaho Bandhan", url: "https://bibahobandhan.com" },
  ],
  creator: "Beta Debug",
  publisher: "Bangali Bibaho Bandhan",
  openGraph: {
    title: "Bangali Bibaho Bandhan",
    description:
      "Bangali Bibaho Bandhan — a Bengali matrimonial platform connecting families.",
    url: "https://bibahobandhan.com",
    siteName: "Bangali Bibaho Bandhan",
    images: [
      {
        url: "https://bibahobandhan.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bangali Bibaho Bandhan — matchmaking for Bengali families",
      },
    ],
    locale: "bn-IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangali Bibaho Bandhan",
    description:
      "Bangali Bibaho Bandhan — a Bengali matrimonial platform connecting families.",
    images: ["https://bibahobandhan.com/og-image.png"],
    creator: "@BangaliBibaho", // update if you have a real handle
  },
  metadataBase: new URL("https://bibahobandhan.com"),
  alternates: {
    canonical: "https://bibahobandhan.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          process.env.NODE_ENV === "development" && "debug-screens",
          `${geistSans.variable} ${geistMono.variable} antialiased`,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProviders>{children}</QueryProviders>
          {process.env.NODE_ENV === "development" && (
            <div className="fixed bottom-4 left-4 z-50">
              <ModeToggle />
            </div>
          )}
          <Toaster />
          <BroadcastModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
