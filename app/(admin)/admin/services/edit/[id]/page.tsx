'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import ServiceForm from '../../new/page';

export default function EditServicePage() {
  const { id } = useParams();
  const supabase = createClient();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      const { data } = await supabase.from('services').select('*').eq('id', id).single();
      if (data) setService(data);
      setLoading(false);
    }
    fetchService();
  }, [id, supabase]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-warm)]">
      {/* 🎯 Updated: Brand Loader color */}
      <Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} />
    </div>
  );

  return <ServiceForm initialData={service} isEdit={true} />;
}