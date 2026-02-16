import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ContactClient from './ContactClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'contact')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Contact | RISA Interior & Contractors - Let's build your vision",
    description: data?.content_value || "Get in touch with RISA Interior & Contractors for luxury interior design, architectural planning, and professional contracting inquiries.",
    alternates: {
      canonical: 'https://www.risainterior.in/contact',
    },
    openGraph: {
      title: "Contact RISA Interior",
      description: "Start your project journey with our architectural and design team.",
      type: 'website',
    },
  };
}

export default async function ContactPage() {
  const supabase = createClient();

  // 🎯 Server-Side Fetch: Populate service dropdown for SEO and performance
  const { data: svcData } = await supabase
    .from('services')
    .select('name')
    .eq('status', 'Active');

  return <ContactClient initialServices={svcData || []} />;
}