import { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/global.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

// ✅ AUTOMATIC DOMAIN DETECTION
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}` 
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "https://www.risainterior.in"; // 🎯 Using your production domain as final fallback

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "RISA Interior & Contractors",
    template: "%s | RISA Interior & Contractors" // Allows dynamic titles for projects/blogs
  },
  description: "Bespoke Architecture & Interior Management. Specializing in luxury residential and commercial design narratives.",
  
  // 🎯 NEW: Google Search Console Verification
  verification: {
    google: "YOUR_UNIQUE_GOOGLE_VERIFICATION_CODE_HERE", // 🛡️ Replace with code from Google
  },

  // 🎯 NEW: Advanced Robots Instruction
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: "/favicon.png", 
    shortcut: "/favicon.png",
    apple: "/favicon.png", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--bg-warm)] antialiased`}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}