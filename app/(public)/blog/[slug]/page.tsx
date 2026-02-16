import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import JournalDetailClient from './JournalDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog')
    .select('title, meta_description, focus_keyword, excerpt, image_url')
    .eq('slug', slug)
    .single();

  if (!post) return { title: "Chronicle Not Found | RISA Studio" };

  const title = `${post.title} | RISA Studio Journal`;
  return {
    title,
    description: post.meta_description || post.excerpt,
    keywords: post.focus_keyword ? [post.focus_keyword, "Architecture", "Design"] : ["Architecture", "Design"],
    alternates: {
      canonical: `https://www.risainterior.in/blog/${slug}`,
    },
    openGraph: {
      title,
      description: post.meta_description || post.excerpt,
      images: [post.image_url],
      type: 'article',
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // 🎯 Server-Side Data Fetching
  const { data: postData } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .single();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('page_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const total = reviews?.length || 0;
  const avg = total > 0 ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : null;

  // 🏛️ JSON-LD SCHEMA: For Blog Posting & Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postData?.title || slug,
    "image": postData?.image_url || "https://risa-interior.com/logo.jpg",
    "description": postData?.meta_description || postData?.excerpt,
    "datePublished": postData?.date,
    "author": { "@type": "Organization", "name": "RISA Studio" },
    ...(avg && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avg,
        "reviewCount": total.toString(),
        "bestRating": "5"
      }
    })
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JournalDetailClient 
        slug={slug} 
        initialPost={postData} 
        initialReviews={reviews || []} 
      />
    </>
  );
}