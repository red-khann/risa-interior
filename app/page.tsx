import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import HomeClient from './HomeClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'home')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "RISA Interior & Contractors | Luxury Architectural Excellence",
    description: data?.content_value || "Architectural precision meets the poetry of light and shadow.",
    alternates: {
      canonical: 'https://www.risainterior.in/',
    },
    keywords: ["Interior Design", "Architecture", "Bareilly Contractors", "Luxury Homes", "RISA Interior"],
    openGraph: {
      title: "RISA Interior | Architectural Integrity",
      description: "Selected works in high-end interior design and architectural planning.",
      type: 'website',
      images: ['https://res.cloudinary.com/risa-interior/image/upload/v1768235958/heroimage_mi1qzn.jpg']
    },
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch Featured Projects
  const { data: projData } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Active')
    .eq('is_featured', true)
    .order('featured_order', { ascending: true })
    .limit(4);

  // 2. Fetch Project-Specific Reviews (for individual card stars)
  const { data: projectReviews } = await supabase
    .from('reviews')
    .select('rating, page_slug')
    .eq('page_type', 'project')
    .eq('status', 'approved');

  // 3. Fetch Home Testimonials (for the slider)
  const { data: testimonialData } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .eq('show_on_home', true)
    .order('created_at', { ascending: false });

  // 4. Global Stats calculation
  const { count: projCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Active');

  const { data: allReviewData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'approved');

  const totalReviews = allReviewData?.length || 0;
  const averageRatingValue = totalReviews > 0 
    ? allReviewData!.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews 
    : 5.0;

  // JSON-LD SCHEMA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "RISA Interior & Contractors",
    "image": "https://res.cloudinary.com/risa-interior/image/upload/v1768235958/heroimage_mi1qzn.jpg",
    "@id": "https://www.risainterior.in/",
    "url": "https://www.risainterior.in/",
    "telephone": "+919634219796",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Thiriya Nizawat Khan, Near Hari Masjid",
      "addressLocality": "Bareilly",
      "addressRegion": "UP",
      "postalCode": "243123",
      "addressCountry": "IN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRatingValue.toFixed(1),
      "reviewCount": totalReviews > 0 ? totalReviews.toString() : "1",
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
      <HomeClient 
        initialProjects={projData || []} 
        projectReviews={projectReviews || []}
        initialTestimonials={testimonialData || []}
        initialProjectCount={projCount || 0} 
        initialAvgRating={averageRatingValue} 
      />
    </>
  );
}