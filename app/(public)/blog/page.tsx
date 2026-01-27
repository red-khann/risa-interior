import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import BlogClient from './BlogClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  // Fetch specific SEO data for the blog archive
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'blog_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Journal | RISA Interior - Architectural Perspectives",
    description: data?.content_value || "Explore our latest chronicles on minimalist design and architecture.",
    keywords: ["Architecture Blog", "Interior Design Trends", "RISA Interior Journal"],
  };
}

export default function BlogPage() {
  return <BlogClient />;
}