import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  // Inter automatically supports optical sizing for 'Display' look
  axes: ["opsz"]
});

export const metadata: Metadata = {
  title: "Wavelaunch Studio",
  description: "D2C Accelerator Application",
};

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark" storageKey="wavelaunch-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
