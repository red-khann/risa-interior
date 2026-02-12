'use client';
import Link from 'next/link';
import { useContent } from '../PreviewProvider'; 
import { Facebook, Instagram, Youtube, Twitter, MapPin } from 'lucide-react';

export const Footer = () => {
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`global:${key}`] || content[key] || fallback;
  };

  const footerData = {
    infoLabel: getVal('footer_info_label', "Information"),
    navLabel: getVal('footer_nav_label', "Navigation"),
    contactLabel: getVal('footer_contact_label', "Contact Us"),
    privacyLabel: getVal('footer_privacy_label', "Privacy Policy"),
    termsLabel: getVal('footer_terms_label', "Term of Use"),
    aboutText: getVal('footer_about_text', "Luxury interior design."),
    location: getVal('footer_location', "Location"),
    // 🎯 New Dynamic Map URL
    mapUrl: getVal('footer_map_url', "#"), 
    email: getVal('footer_email', "email@example.com"),
    phone: getVal('footer_phone', "phone"),
    copyright: getVal('footer_copyright', `© ${new Date().getFullYear()} RISA.`),
    fbUrl: getVal('footer_fb_url', "#"),
    igUrl: getVal('footer_ig_url', "#"),
    ytUrl: getVal('footer_yt_url', "#"),
    xUrl: getVal('footer_x_url', "#"),
  };

  let links = [];
  try {
    const rawLinks = content['global:nav_menu'] || content['nav_menu'];
    links = rawLinks ? JSON.parse(rawLinks) : [];
  } catch (e) {
    console.error("Footer Navigation Parse Error");
  }

  const socials = [
    { icon: <Facebook size={14} aria-hidden="true" />, url: footerData.fbUrl, label: "Facebook" },
    { icon: <Instagram size={14} aria-hidden="true" />, url: footerData.igUrl, label: "Instagram" },
    { icon: <Youtube size={14} aria-hidden="true" />, url: footerData.ytUrl, label: "YouTube" },
    { icon: <Twitter size={14} aria-hidden="true" />, url: footerData.xUrl, label: "Twitter" },
  ];

  return (
    <footer className="bg-[var(--text-primary)] text-white pt-24 pb-8 selection:bg-[var(--accent-light)]/30" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-24">
          
          {/* Info & Socials */}
          <section className="space-y-8">
            <div className="inline-block border-b border-white/20 pb-2">
               <h3 className="text-xl font-bold tracking-widest uppercase text-white">{footerData.infoLabel}</h3>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs uppercase tracking-wider italic font-serif">
              {footerData.aboutText}
            </p>
            <nav className="flex gap-3" aria-label="Social media links">
              {socials.map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" 
                   aria-label={social.label}
                   className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-white hover:bg-[var(--accent-light)] hover:border-[var(--accent-light)] transition-all duration-500">
                  {social.icon}
                </a>
              ))}
            </nav>
          </section>

          {/* Navigation */}
          <nav className="space-y-10" aria-label="Footer Navigation">
            <div className="inline-block border-b border-[var(--accent-light)]/20 pb-2">
              <h4 className="text-[12px] uppercase tracking-[0.4em] font-black text-[var(--accent-light)]">{footerData.navLabel}</h4>
            </div>
            <ul className="space-y-4">
              {links.map((link: any) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-zinc-400 hover:text-white transition-colors uppercase tracking-widest text-[11px] font-bold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Details with Dynamic Map Link */}
          <section className="space-y-10">
            <div className="inline-block border-b border-[var(--accent-light)]/20 pb-2">
              <h4 className="text-[12px] uppercase tracking-[0.4em] font-black text-[var(--accent-light)]">{footerData.contactLabel}</h4>
            </div>
            <address className="not-italic space-y-4 text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
              {/* 🎯 Updated: Location now links to the dynamic mapUrl */}
              <a 
                href={footerData.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-white transition-colors group"
              >
                <MapPin size={14} className="mt-0.5 text-[var(--accent-light)] group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed underline underline-offset-4 decoration-zinc-800 group-hover:decoration-[var(--accent-light)]">
                  {footerData.location}
                </span>
              </a>
              <p><a href={`mailto:${footerData.email}`} className="hover:text-white transition-colors block mt-2">{footerData.email}</a></p>
              <p><a href={`tel:${footerData.phone}`} className="hover:text-white transition-colors">{footerData.phone}</a></p>
            </address>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">
          <p>{footerData.copyright}</p>
          <nav className="flex gap-10" aria-label="Legal links">
            <Link href="/privacy" className="hover:text-white transition-colors">{footerData.privacyLabel}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{footerData.termsLabel}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};