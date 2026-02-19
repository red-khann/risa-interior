import { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/global.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });
const baseUrl = "https://www.risainterior.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "RISA Interior & Contractors",
    template: "%s | RISA Interior & Contractors"
  },
  description: "Bespoke Architecture & Interior Management. Specializing in luxury residential and commercial design narratives.",
  openGraph: {
    title: "RISA Interior & Contractors",
    description: "Bespoke Architecture & Interior Management. Specializing in luxury residential and commercial design narratives.",
    url: baseUrl,
    siteName: "RISA Interior & Contractors",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/opengraph-image`, 
        width: 1200,
        height: 630,
        alt: "RISA Interior & Contractors | Luxury Architectural Excellence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RISA Interior & Contractors",
    description: "Bespoke Architecture & Interior Management.",
    images: [`${baseUrl}/opengraph-image`], 
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
    { url: '/favicon.svg', type: 'image/svg+xml' }, 
    { url: '/favicon.png', type: 'image/png' },
  ],
  shortcut: '/favicon.png',
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  // 🎯 SEO FETCH: Get all site content on the server to prevent layout shift
  const { data } = await supabase
    .from('site_content')
    .select('page_key, section_key, content_value');

  const initialMap: Record<string, any> = {};
  if (data) {
    data.forEach((item) => {
      initialMap[`${item.page_key}:${item.section_key}`] = item.content_value;
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--bg-warm)] antialiased`}>
        {/* Pass the server-fetched data to the client wrapper */}
        <ClientLayoutWrapper initialData={initialMap}>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}