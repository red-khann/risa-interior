'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext<any>({});

// 🎯 FIX: Added initialData prop to the interface
export const PreviewProvider = ({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode; 
  initialData?: any 
}) => {
  // 🎯 FIX: Initialize state with initialData if provided
  const [content, setContent] = useState<any>(initialData || {});

  // Update content if initialData changes (hydration)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setContent(initialData);
    }
  }, [initialData]);

  // Listen for the Admin Panel messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CMS_UPDATE') {
        const { key, value } = event.data;
        setContent((prev: any) => ({ ...prev, [key]: value }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);