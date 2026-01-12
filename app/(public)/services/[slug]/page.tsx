import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ServiceDetailClient from './ServiceDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

// 🎯 SEO: Dynamic Metadata Generation for Search Engines
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: service } = await supabase
    .from('services')
    .select('name, meta_description, focus_keyword, image_url, service_type')
    .eq('slug', slug)
    .single();

  if (!service) return { title: "Service Protocol | RISA Studio" };

  const title = `${service.name} | ${service.service_type} Excellence | RISA Studio`;
  const description = service.meta_description || `Professional ${service.name} services by RISA Studio.`;

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
  };
}

// 🎯 Page Component: Unwraps params and boots the Client UI
export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ServiceDetailClient slug={slug} />;
}