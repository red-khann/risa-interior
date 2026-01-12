"use client"; 

import { Inter } from "next/font/google";
import "../styles/global.css"; 
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { usePathname } from "next/navigation";
import { PreviewProvider } from "../components/PreviewProvider"; 
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  
  // 🎯 State initialized as an Object (Record) to match PreviewProvider expectations
  const [formattedContent, setFormattedContent] = useState<Record<string, any>>({});
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      // Fetch the site content for global and page-specific live updates
      const { data } = await supabase
        .from('site_content')
        .select('page_key, section_key, content_value');
      
      if (data) {
        // 🎯 Transformation: Converts Supabase Array [{...}] into Key-Value Object {'home:title': '...'}
        // This ensures the useContent() hook in your pages finds data instantly.
        const initialMap = data.reduce((acc: any, item: any) => ({
          ...acc, 
          [`${item.page_key}:${item.section_key}`]: item.content_value
        }), {});
        
        setFormattedContent(initialMap);
      }
    };
    getData();
  }, [supabase]);

  return (
    // 🎯 suppressHydrationWarning prevents the console warnings about mismatched classNames
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F7F5F2] antialiased`}>
        {/* 🎯 PreviewProvider now receives the correct Object structure */}
        <PreviewProvider initialData={formattedContent}>
          
          {/* Only show site navigation if we are NOT in the admin panel */}
          {!isAdmin && <Navbar />} 
          
          <main className="min-h-screen">
            {children}
          </main>
          
          {!isAdmin && <Footer />}
          
        </PreviewProvider>
      </body>
    </html>
  );
}