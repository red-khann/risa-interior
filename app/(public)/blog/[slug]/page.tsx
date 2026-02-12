import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import JournalDetailClient from './JournalDetailClient';

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
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // 🎯 Fetch Rating Data for Schema
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('page_slug', params.slug)
    .eq('status', 'approved');

  const total = reviews?.length || 0;
  const avg = total > 0 ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : null;

  // 🏛️ JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": params.slug,
    "image": "https://risa-interior.com/logo.jpg",
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
      <JournalDetailClient slug={params.slug} />
    </>
  );
}