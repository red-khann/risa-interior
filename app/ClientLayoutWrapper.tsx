"use client";

import { usePathname } from "next/navigation";
import { PreviewProvider } from "@/components/PreviewProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  initialData: Record<string, any>;
}

export default function ClientLayoutWrapper({
  children,
  initialData,
}: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <PreviewProvider initialData={initialData}>
      {/* 🎯 Navbar and Footer now have instant access to brand content from server */}
      {!isAdmin && <Navbar />} 
      
      <main className="min-h-screen">
        {children}
      </main>
      
      {!isAdmin && <Footer />}
    </PreviewProvider>
  );
}