import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.risainterior.in'

  // Define types for change frequencies to ensure TS compliance
  const WEEKLY = 'weekly' as const
  const MONTHLY = 'monthly' as const

  // 1. Fetch Dynamic Data with Error Handling
  // We use .select('*') or specific columns to ensure we get metadata
  const [
    { data: projects },
    { data: services },
    { data: blogPosts }
  ] = await Promise.all([
    supabase.from('projects').select('slug, updated_at').eq('status', 'Active'),
    supabase.from('services').select('slug, updated_at').eq('status', 'Active'),
    supabase.from('blog').select('slug, updated_at').eq('status', 'Active'),
  ])

  // 2. Define Static Routes (Priority hierarchy)
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/projects',
    '/services',
    '/blog',
    '/about',
    '/contact',
    '/reviews', 
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: WEEKLY,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 3. Map Project Portfolio Routes (0.7 Priority)
  const projectRoutes: MetadataRoute.Sitemap = (projects || []).map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: MONTHLY,
    priority: 0.7,
  }))

  // 4. Map Studio Expertise Routes (0.7 Priority)
  const serviceRoutes: MetadataRoute.Sitemap = (services || []).map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(s.updated_at || new Date()),
    changeFrequency: MONTHLY,
    priority: 0.7,
  }))

  // 5. Map Journal/Blog Routes (0.6 Priority)
  const blogRoutes: MetadataRoute.Sitemap = (blogPosts || []).map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at || new Date()),
    changeFrequency: WEEKLY,
    priority: 0.6,
  }))

  // Combine all routes into the final XML structure
  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...blogRoutes]
}