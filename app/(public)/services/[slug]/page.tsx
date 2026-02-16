import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ServiceDetailClient from './ServiceDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: service } = await supabase
    .from('services')
    .select('name, meta_description, focus_keyword, image_url, service_type')
    .eq('slug', slug)
    .single();

  if (!service) return { title: "Service Protocol | RISA Interior & Contractors" };

  const title = `${service.name} | ${service.service_type} | RISA Interior`;
  const description = service.meta_description || `Professional ${service.name} services by RISA Interior & Contractors.`;

  return {
    title,
    description,
    keywords: service.focus_keyword ? [service.focus_keyword, service.service_type, "Architectural Design"] : [service.service_type, "Design"],
    alternates: {
        canonical: `https://www.risainterior.in/services/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [service.image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [service.image_url],
    }
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // 🎯 Fetch Service Details
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  // 🎯 Fetch Review Data
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('page_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const count = reviews?.length || 0;
  const avg = count > 0 ? (reviews!.reduce((a, b) => a + b.rating, 0) / count).toFixed(1) : "5.0";

  // 🏛️ JSON-LD SCHEMA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service?.name || slug,
    "description": service?.meta_description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "RISA Interior & Contractors",
      "image": "https://www.risainterior.in/logo.jpg"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avg,
      "reviewCount": count > 0 ? count.toString() : "1",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailClient 
        slug={slug} 
        initialService={service} 
        initialReviews={reviews || []} 
      />
    </>
  );
}