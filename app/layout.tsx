import { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/global.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

// ✅ AUTOMATIC DOMAIN DETECTION
// This detects your environment (Local, Vercel Preview, or Production)
// so you never have to manually update the domain.
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}` 
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "RISA Interior & Contractors",
  description: "Bespoke Architecture & Interior Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F7F5F2] antialiased`}>
        {/* Pass children to the Client Wrapper for state & hooks logic */}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}