import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ProjectDetailClient from './ProjectDetailClient';

// 🎯 SEO: Dynamic Metadata Generation
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('title, meta_description, focus_keyword, image_url, category, city')
    .eq('slug', params.slug)
    .single();

  if (!project) return { title: "Project Archive | RISA Studio" };

  const title = `${project.title} | ${project.category} in ${project.city} | RISA Studio`;
  const description = project.meta_description || `Explore the architectural details of ${project.title}, a ${project.category} project by RISA Studio.`;

  return {
    title,
    description,
    keywords: project.focus_keyword ? [project.focus_keyword, project.category, "Architectural Design"] : [project.category, "Architecture"],
    openGraph: {
      title,
      description,
      images: [project.image_url],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [project.image_url],
    }
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProjectDetailClient slug={params.slug} />;
}