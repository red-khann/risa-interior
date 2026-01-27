import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ContactClient from './ContactClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  // Fetch SEO-specific content from your site_content table
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'contact')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Contact | RISA Interior - Let's build your vision",
    description: data?.content_value || "Get in touch with RISA Interior for luxury interior design and architectural planning inquiries.",
    openGraph: {
      title: "Contact RISA Interior",
      description: "Start your project journey with our architectural and design team.",
      type: 'website',
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}