"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PreviewProvider } from "@/components/PreviewProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [formattedContent, setFormattedContent] = useState<Record<string, any>>({});
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('page_key, section_key, content_value');
      
      if (data) {
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
    <PreviewProvider initialData={formattedContent}>
      {/* 🎯 Site Nav is hidden for Admin, Navbar and Footer now use brand colors */}
      {!isAdmin && <Navbar />} 
      
      <main className="min-h-screen">
        {children}
      </main>
      
      {!isAdmin && <Footer />}
    </PreviewProvider>
  );
}