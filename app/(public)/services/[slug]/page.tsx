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

  // 🎯 DATA PROTOCOL: Fetch rating data specifically for Google's rich snippets
  const { data: revData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('page_slug', slug)
    .eq('status', 'approved');

  const count = revData?.length || 0;
  const avg = count > 0 ? (revData!.reduce((a, b) => a + b.rating, 0) / count).toFixed(1) : "5.0";

  // 🏛️ JSON-LD SCHEMA: The machine-readable signal for Google Stars
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": slug, // Providing the specific service name
    "provider": {
      "@type": "LocalBusiness",
      "name": "RISA Interior & Contractors",
      "image": "https://risa-interior.com/logo.jpg"
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
      {/* 🎯 Schema Injection: This makes the stars appear in Google Search Console */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailClient slug={slug} />
    </>
  );
}