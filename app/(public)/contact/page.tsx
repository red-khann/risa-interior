'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useContent } from '@/components/PreviewProvider'; 

export default function ContactPage() {
  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState(""); 
  
  const liveContent = useContent();

  const getUI = (key: string, fallback: string) => {
    return liveContent[`contact:${key}`] || fallback;
  };

  const content = {
    subtitle: getUI('contact_subtitle', "Contact Us"),
    title: getUI('contact_title', "Let's build your [vision] together."),
    bizLabel: getUI('business_label', "New Business"),
    email: getUI('contact_email', "hello@risastudio.com"),
    addrLabel: getUI('address_label', "Studio Address"),
    address: getUI('contact_address', "123 Design District, Suite 400\nNew York, NY 10001")
  };

  useEffect(() => {
    async function fetchServices() {
      const { data: svcData } = await supabase
        .from('services')
        .select('name')
        .eq('status', 'Active');
      
      if (svcData) {
        setServices(svcData);
        if (svcData.length > 0) setSelectedService(svcData[0].name);
      }
    }
    fetchServices();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const clientName = formData.get('client_name') as string;
    const contactInfo = formData.get('contact_info') as string;
    const description = formData.get('description') as string;

    const finalService = selectedService === "Other" 
      ? formData.get('custom_service') as string
      : selectedService;

    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('enquiries').insert([{
        client_name: clientName,
        contact_info: contactInfo,
        service_type: finalService,
        description: description,
        protocol_status: 'New Lead'
      }]);

      if (error) throw error;

      // 2. ⚡ 🔄 UPDATED: Trigger Email Notification via Resend
      await fetch('/api/notify-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          email: contactInfo, // Mapping contact_info to email for the notification
          phone: "See contact info", // Or add a specific phone field if needed
          service: finalService,
          message: description
        }),
      });

      setSubmitted(true);
      formRef.current?.reset();
      if (services.length > 0) setSelectedService(services[0].name); 
      setTimeout(() => setSubmitted(false), 5000);

    } catch (err: any) {
      alert("Transmission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-32 pb-20 bg-[#F7F5F2] min-h-screen selection:bg-[#B89B5E]/20">
      <section className="max-w-7xl mx-auto px-6 lg:px-12" aria-labelledby="contact-heading">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          <div className="space-y-16">
            <header>
              <h2 id="contact-heading" className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold mb-6 italic">
                {content.subtitle}
              </h2>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[0.85] mb-12 text-zinc-900 uppercase whitespace-pre-line animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {content.title.split(/(\[.*?\])/g).map((part, i) => part.startsWith('[') ? 
                  <span key={i} className="font-serif italic text-zinc-300">{part.slice(1, -1)}</span> : part
                )}
              </h1>
            </header>

            <address className="not-italic space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-900 mb-4">
                  {content.bizLabel}
                </h3>
                <p className="text-xl font-light text-zinc-500">
                  <a href={`mailto:${content.email}`} className="hover:text-[#B89B5E] transition-colors">{content.email}</a>
                </p>
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-900 mb-4">
                  {content.addrLabel}
                </h3>
                <p className="text-xl font-light text-zinc-500 leading-relaxed whitespace-pre-line">
                  {content.address}
                </p>
              </div>
            </address>
          </div>

          <section className="bg-white p-10 md:p-16 border border-zinc-100 shadow-sm relative" aria-label="Inquiry Form">
            {submitted && (
              <div role="alert" className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                <p className="text-[#B89B5E] text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Inquiry Chronicled</p>
                <p className="text-zinc-500 font-serif italic text-xl">Thank you. Your vision has been submitted.</p>
                <button onClick={() => setSubmitted(false)} className="mt-10 text-[9px] uppercase tracking-widest border-b border-zinc-200 pb-1">Send another</button>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="client_name" className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Name</label>
                  <input id="client_name" name="client_name" required type="text" className="w-full bg-transparent border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-all font-light" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact_info" className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Email or Contact No.</label>
                  <input id="contact_info" name="contact_info" required type="text" className="w-full bg-transparent border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-all font-light" placeholder="contact detail" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service_interest" className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Service Interest</label>
                <div className="relative">
                  <select 
                    id="service_interest"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-all font-light appearance-none cursor-pointer"
                  >
                    {services.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                    <option value="Other">Other / Custom Inquiry</option>
                  </select>
                </div>
              </div>

              {selectedService === "Other" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="custom_service" className="text-[10px] uppercase tracking-widest font-bold text-[#B89B5E]">Specify Your Interest</label>
                  <input id="custom_service" name="custom_service" required type="text" className="w-full bg-transparent border-b border-[#B89B5E] py-3 focus:border-zinc-900 outline-none transition-all font-light" placeholder="e.g. Sustainable Landscape Design" />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="description" className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Message</label>
                <textarea id="description" name="description" required rows={4} className="w-full bg-transparent border-b border-zinc-200 py-3 focus:border-zinc-900 outline-none transition-all font-light resize-none" placeholder="Tell us about your project..." />
              </div>

              <button type="submit" disabled={loading} className="w-full py-6 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#B89B5E] transition-all disabled:opacity-50">
                {loading ? "Transmitting..." : "Send Inquiry"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}