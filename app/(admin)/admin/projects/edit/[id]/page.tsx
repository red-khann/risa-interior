'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import CompleteSEOProjectForm from '../../new/page';

export default function EditProjectPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single();
      if (data) setProject(data);
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#F7F5F2]">
      <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
    </div>
  );

  return <CompleteSEOProjectForm initialData={project} isEdit={true} />;
}