import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ProjectsClient from './ProjectsClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'projects_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Portfolio | RISA Interior & Contractors - Architectural Excellence",
    description: data?.content_value || "Explore our curated archive of luxury residential and commercial architectural projects by RISA Interior & Contractors.",
    alternates: { canonical: 'https://www.risainterior.in/projects' },
    keywords: ["Architectural Portfolio", "Luxury Interior Design", "Bareilly Contractors", "RISA Projects"],
    openGraph: {
      title: "RISA Interior Portfolio | Selected Works",
      description: "A study in structural honesty and light-filled minimalist architecture.",
      type: 'website',
    },
  };
}

export default async function ProjectsPage() {
  const supabase = await createClient();

  // 🎯 Fetch projects and reviews in parallel on the server
  const [projectsRes, reviewsRes] = await Promise.all([
    supabase.from('projects').select('*').neq('status', 'Draft').order('created_at', { ascending: false }),
    supabase.from('reviews').select('rating, page_slug').eq('page_type', 'project').eq('status', 'approved')
  ]);

  const projects = projectsRes.data || [];
  const reviews = reviewsRes.data || [];

  // 🎯 Pre-calculate ratings on the server to pass to ProjectCards
  const initialProjects = projects.map(project => {
    const projectReviews = reviews.filter(r => r.page_slug === project.slug);
    const avgRating = projectReviews.length > 0 
      ? projectReviews.reduce((acc, r) => acc + r.rating, 0) / projectReviews.length 
      : 0;
    return { ...project, avgRating };
  });

  return <ProjectsClient initialProjects={initialProjects} />;
}