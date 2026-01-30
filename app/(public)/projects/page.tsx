import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ProjectsClient from './ProjectsClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'projects_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Portfolio | RISA Interior & Contractors - Architectural Excellence",
    description: data?.content_value || "Explore our curated archive of luxury residential and commercial architectural projects by RISA Interior & Contractors.",
    keywords: ["Architectural Portfolio", "Luxury Interior Design", "Bareilly Contractors", "RISA Projects"],
    openGraph: {
      title: "RISA Interior Portfolio | Selected Works",
      description: "A study in structural honesty and light-filled minimalist architecture.",
      type: 'website',
    },
  };
}

export default function ProjectsPage() {
  return <ProjectsClient />;
}