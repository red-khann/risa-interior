import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import BlogClient from './BlogClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'blog_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Journal | RISA Interior & Contractors - Architectural Perspectives",
    description: data?.content_value || "Explore our latest chronicles on minimalist design, architectural integrity, and professional contracting.",
    keywords: ["Architecture Blog", "Interior Design Bareilly", "RISA Interior Journal", "Contracting Trends"],
  };
}

export default function BlogPage() {
  return <BlogClient />;
}