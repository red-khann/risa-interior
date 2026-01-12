'use client';
import Link from 'next/link';
import { useContent } from '../PreviewProvider'; 
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export const Footer = () => {
  const content = useContent();

  const getVal = (key: string, fallback: string) => {
    return content[`global:${key}`] || content[key] || fallback;
  };

  const footerData = {
    infoLabel: getVal('footer_info_label', "Information"),
    navLabel: getVal('footer_nav_label', "Navigation"),
    contactLabel: getVal('footer_contact_label', "Contact Us"),
    newsLabel: getVal('footer_news_label', "Newsletter"),
    newsPlaceholder: getVal('footer_news_placeholder', "EMAIL ADDRESS"),
    newsButton: getVal('footer_news_button', "Subscribe"),
    privacyLabel: getVal('footer_privacy_label', "Privacy Policy"),
    termsLabel: getVal('footer_terms_label', "Term of Use"),
    aboutText: getVal('footer_about_text', "Luxury interior design."),
    location: getVal('footer_location', "Location"),
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
    <footer className="bg-[#121212] text-white pt-24 pb-8 selection:bg-[#B89B5E]/30" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Info & Socials */}
          <section className="space-y-8">
            <h3 className="text-xl font-bold tracking-widest uppercase">{footerData.infoLabel}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs uppercase tracking-wider italic font-serif">
              {footerData.aboutText}
            </p>
            <nav className="flex gap-3" aria-label="Social media links">
              {socials.map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" 
                   aria-label={social.label}
                   className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-[#B89B5E] hover:border-[#B89B5E] transition-all duration-500">
                  {social.icon}
                </a>
              ))}
            </nav>
          </section>

          {/* Navigation */}
          <nav className="space-y-10" aria-label="Footer Navigation">
            <h4 className="text-[12px] uppercase tracking-[0.3em] font-bold text-[#B89B5E]">{footerData.navLabel}</h4>
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

          {/* Contact Details */}
          <section className="space-y-10">
            <h4 className="text-[12px] uppercase tracking-[0.3em] font-bold text-[#B89B5E]">{footerData.contactLabel}</h4>
            <address className="not-italic space-y-4 text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
              <p className="leading-relaxed">{footerData.location}</p>
              <p><a href={`mailto:${footerData.email}`} className="hover:text-white transition-colors">{footerData.email}</a></p>
              <p><a href={`tel:${footerData.phone}`} className="hover:text-white transition-colors">{footerData.phone}</a></p>
            </address>
          </section>

          {/* Newsletter */}
          <section className="space-y-10">
            <h4 className="text-[12px] uppercase tracking-[0.3em] font-bold text-[#B89B5E]">{footerData.newsLabel}</h4>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="sr-only">Email Address</label>
              <input 
                id="footer-email"
                type="email" 
                placeholder={footerData.newsPlaceholder} 
                required
                className="bg-zinc-900 border border-zinc-800 p-4 text-[10px] tracking-widest focus:border-[#B89B5E] outline-none" 
              />
              <button type="submit" className="bg-zinc-800 py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#B89B5E] transition-all">
                {footerData.newsButton}
              </button>
            </form>
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