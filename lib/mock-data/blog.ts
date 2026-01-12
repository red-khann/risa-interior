export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  status: string;
  image: string;
  // 💡 Missing fields required by your new slug page:
  content: string;
  metaDescription: string;
  heroAltText: string;
  relatedService?: string;
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "5 Trends in Modern Minimalist Design for 2026",
    slug: "modern-minimalist-trends-2026",
    excerpt: "Discover how simplicity is evolving into 'Warm Minimalism' this year.",
    date: "Jan 12, 2026",
    category: "Design Trends",
    status: "active",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop",
    // 💡 Added Data
    heroAltText: "A brightly lit minimalist living room with oak furniture",
    metaDescription: "Exploring the shift from cold minimalism to 'Warm Minimalism' in 2026 residential projects.",
    content: "The evolution of minimalism in 2026 is marked by a shift toward organic textures and warmer color palettes.\n\nDesigners are now focusing on 'Sensory Minimalism,' where the tactile quality of materials like lime-wash plaster and brushed metal takes center stage. This approach ensures that spaces feel lived-in and comfortable while maintaining a clean architectural silhouette.",
    relatedService: "Interior Architecture"
  },
  {
    id: "2",
    title: "How to Choose the Right Contractor for Your Home",
    slug: "choosing-contractor",
    excerpt: "Everything you need to check before signing a renovation contract.",
    date: "Jan 05, 2026",
    category: "Pro Tips",
    status: "active",
    image: "https://plus.unsplash.com/premium_photo-1681989497830-fe4a50acfbfb?q=60&w=1200",
    // 💡 Added Data
    heroAltText: "An architect and contractor discussing blueprints on a construction site",
    metaDescription: "A professional guide on vetting contractors, checking licenses, and understanding architectural contracts.",
    content: "Selecting a contractor is the most critical decision in any renovation project. Beyond just comparing quotes, you must evaluate their communication style and past performance.\n\nAlways request a detailed 'Scope of Work' and ensure that the contract includes clear milestones and material specifications. A successful project is built on the foundation of a transparent partnership between the owner and the builder.",
    relatedService: "General Contracting"
  }
];