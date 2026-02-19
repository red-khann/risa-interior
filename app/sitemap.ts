import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.risainterior.in'

  // 1. Fetch only 'Active' data individually for better stability
  // Ensure the string 'Active' matches exactly what is in your Supabase table
  const { data: projects } = await supabase
    .from('projects')
    .select('slug')
    .eq('status', 'Active')

  const { data: services } = await supabase
    .from('services')
    .select('slug')
    .eq('status', 'Active')

  const { data: blogPosts } = await supabase
    .from('blog')
    .select('slug')
    .eq('status', 'Active')

  // 2. Static Routes (Priority 1.0 - 0.8)
  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/projects', '/services', '/blog', '/about', '/contact', '/reviews'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 3. Project Routes (Priority 0.7)
  const projectRoutes: MetadataRoute.Sitemap = (projects || []).map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 4. Service Routes (Priority 0.7)
  const serviceRoutes: MetadataRoute.Sitemap = (services || []).map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 5. Blog Routes (Priority 0.6)
  const blogRoutes: MetadataRoute.Sitemap = (blogPosts || []).map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...blogRoutes]
}