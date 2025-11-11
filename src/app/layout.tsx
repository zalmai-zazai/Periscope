import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"; // Add this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Periscope - Property Damage Assessment & Restoration Management",
  description:
    "Streamline your property damage assessment workflow with AI-powered tools, equipment recommendations, and comprehensive reporting for restoration professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          {/* Add Toaster here */}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            theme="system" // This will follow your theme provider
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
