import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ProjectDetailClient from './ProjectDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('title, meta_description, focus_keyword, image_url, category, city')
    .eq('slug', slug)
    .single();

  if (!project) return { title: "Project Archive | RISA Interior & Contractors" };

  const title = `${project.title} | ${project.category} in ${project.city} | RISA Interior`;
  return {
    title,
    description: project.meta_description || `Explore the architectural details of ${project.title}.`,
    alternates: {
      canonical: `https://www.risainterior.in/projects/${slug}`,
    },
    openGraph: { title, images: [project.image_url], type: 'article' },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // 🎯 Server-Side Fetch
  const { data: projectData } = await supabase
    .from('projects')
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
  const avg = total > 0 
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) 
    : "5.0";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": projectData?.title || slug,
    "author": { "@type": "Organization", "name": "RISA Interior" },
    "image": projectData?.image_url,
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
      <ProjectDetailClient 
        slug={slug} 
        initialProject={projectData} 
        initialReviews={reviews || []} 
      />
    </>
  );
}