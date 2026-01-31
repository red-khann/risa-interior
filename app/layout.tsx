import { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/global.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}` 
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "https://www.risainterior.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "RISA Interior & Contractors",
    template: "%s | RISA Interior & Contractors"
  },
  description: "Bespoke Architecture & Interior Management. Specializing in luxury residential and commercial design narratives.",
  
  // 🎯 Social Media Protocol: Open Graph
  openGraph: {
    title: "RISA Interior & Contractors",
    description: "Bespoke Architecture & Interior Management. Specializing in luxury residential and commercial design narratives.",
    url: "https://www.risainterior.in",
    siteName: "RISA Interior & Contractors",
    locale: "en_US",
    type: "website",
    // 💡 This automatically uses the /opengraph-image file we created
  },

  // 🎯 Professional Branding for X (Twitter)
  twitter: {
    card: "summary_large_image",
    title: "RISA Interior & Contractors",
    description: "Bespoke Architecture & Interior Management.",
  },

  verification: {
    google: "YOUR_UNIQUE_GOOGLE_VERIFICATION_CODE_HERE", 
  },

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
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.png", sizes: "144x144", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
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