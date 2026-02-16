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
    alternates: {
      canonical: 'https://www.risainterior.in/blog',
    },
    keywords: ["Architecture Blog", "Interior Design Bareilly", "RISA Interior Journal", "Contracting Trends"],
  };
}

export default async function BlogPage() {
  const supabase = createClient();

  // 🎯 Server-Side Data Fetching
  const { data: blogData } = await supabase
    .from('blog')
    .select('*')
    .eq('status', 'Active');

  const { data: reviewData } = await supabase
    .from('reviews')
    .select('rating, page_slug')
    .eq('page_type', 'blog')
    .eq('status', 'approved');

  // Format data on server
  const initialPosts = blogData?.map(post => {
    const relevantReviews = reviewData?.filter(r => r.page_slug === post.slug) || [];
    const avg = relevantReviews.length > 0 
      ? relevantReviews.reduce((acc, r) => acc + r.rating, 0) / relevantReviews.length 
      : 0;
    return { ...post, avgRating: avg };
  }) || [];

  return <BlogClient initialPosts={initialPosts} />;
}