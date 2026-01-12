import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import JournalDetailClient from './JournalDetailClient';

// 🎯 SEO: Fetching Dynamic Metadata for the Chronicle
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('blog')
    .select('title, meta_description, focus_keyword, excerpt, image_url')
    .eq('slug', params.slug)
    .single();

  if (!post) return { title: "Chronicle Not Found | RISA Studio" };

  return {
    title: `${post.title} | RISA Studio Journal`,
    description: post.meta_description || post.excerpt,
    keywords: post.focus_keyword ? [post.focus_keyword, "Architecture", "Design"] : ["Architecture", "Design"],
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt,
      images: [post.image_url],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description,
      images: [post.image_url],
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <JournalDetailClient slug={params.slug} />;
}