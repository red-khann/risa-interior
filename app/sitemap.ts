import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient() // 🎯 Added await for server-side stability
  const baseUrl = 'https://www.risainterior.in'

  // 1. Fetch Dynamic Data from Supabase
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
  const staticRoutes = [
    '',
    '/projects',
    '/services',
    '/blog',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 3. Map Project Portfolio Routes
  const projectRoutes = (projects || []).map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // 4. Map Studio Expertise Routes
  const serviceRoutes = (services || []).map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(s.updated_at || new Date()), // 🎯 Uses updated_at for freshness
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // 5. Map Journal/Blog Routes
  const blogRoutes = (blogPosts || []).map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...blogRoutes]
}