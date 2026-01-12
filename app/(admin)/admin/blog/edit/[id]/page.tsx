'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import NewBlogForm from '../../new/page';

export default function EditBlogPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase.from('blog').select('*').eq('id', id).single();
      if (data) setPost(data);
      setLoading(false);
    }
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#F7F5F2]">
      <Loader2 className="animate-spin text-[#B89B5E]" size={32} />
    </div>
  );

  return <NewBlogForm initialData={post} isEdit={true} />;
}