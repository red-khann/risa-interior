import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = 'https://risa-interior.in'; // 🎯 Replace with your actual domain

  // 1. Fetch all active slugs
  const { data: projects } = await supabase.from('projects').select('slug, updated_at').eq('status', 'Active');
  const { data: blogs } = await supabase.from('blog').select('slug, updated_at').ilike('status', 'active');
  const { data: services } = await supabase.from('services').select('slug').eq('status', 'Active');

  // 2. Static Pages
  const staticPages = ['', '/about', '/services', '/projects', '/blog', '/contact'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. Dynamic Project Pages
  const projectEntries = (projects || []).map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 4. Dynamic Blog Pages
  const blogEntries = (blogs || []).map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 5. Dynamic Service Pages
  const serviceEntries = (services || []).map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...projectEntries, ...blogEntries, ...serviceEntries];
}