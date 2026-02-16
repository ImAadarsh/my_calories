import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Calories - AI Powered Nutrition",
  description: "Track your calories with Gemini AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <main className="max-w-md mx-auto min-h-screen border-x bg-white relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
