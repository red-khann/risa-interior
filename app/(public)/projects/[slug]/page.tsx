import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ProjectDetailClient from './ProjectDetailClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('title, meta_description, focus_keyword, image_url, category, city')
    .eq('slug', params.slug)
    .single();

  if (!project) return { title: "Project Archive | RISA Interior & Contractors" };

  const title = `${project.title} | ${project.category} in ${project.city} | RISA Interior`;
  return {
    title,
    description: project.meta_description || `Explore the architectural details of ${project.title}.`,
    openGraph: { title, images: [project.image_url], type: 'article' },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // 🎯 DATA PROTOCOL: Fetch specific project rating for Search Console
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('page_slug', params.slug)
    .eq('status', 'approved');

  const total = reviews?.length || 0;
  const avg = total > 0 
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) 
    : "5.0";

  // 🏛️ JSON-LD SCHEMA: The "Signal" for Google Stars
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": params.slug,
    "author": { "@type": "Organization", "name": "RISA Interior" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avg,
      "reviewCount": total > 0 ? total.toString() : "1",
      "bestRating": "5"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient slug={params.slug} />
    </>
  );
}