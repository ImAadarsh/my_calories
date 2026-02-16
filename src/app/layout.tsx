import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: "My Calories - AI Powered Nutrition",
  description: "Track your calories with Gemini AI",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Calories",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My Calories" />
      </head>
      <body className={`${outfit.variable} ${plusJakartaSans.variable} font-sans bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <main className="max-w-md mx-auto min-h-screen border-x bg-white relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
