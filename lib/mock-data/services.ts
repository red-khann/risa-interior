export interface Service {
  id: string;
  name: string;
  slug: string;
  serviceType: string;
  startingPrice: string;
  metaDescription: string;
  description: string;
  image: string;
  heroAltText: string;
}

export const MOCK_SERVICES: Service[] = [
  {
    id: "s1",
    name: "Architectural Design",
    slug: "architectural-design",
    serviceType: "New Construction",
    startingPrice: "Starting at $12,500",
    metaDescription: "Creating structural narratives that balance raw materiality with light-filled spatial logic.",
    description: "Our architectural design protocol begins with a deep analysis of site topography and light orientation.\n\nWe prioritize 'structural honesty'—allowing materials like raw concrete, oak wood, and steel to express their natural textures. This service covers everything from initial spatial planning and 3D modeling to local permit documentation and site oversight.",
    image: "https://images.unsplash.com/photo-1487958449643-4121b155d747?q=80&w=2070",
    heroAltText: "Minimalist concrete architectural structure with floor-to-ceiling glass"
  },
  {
    id: "s2",
    name: "Interior Architecture",
    slug: "interior-architecture",
    serviceType: "Renovation & Luxury Fit-outs",
    startingPrice: "Starting at $8,500",
    metaDescription: "Sculpting interior environments through bespoke furniture, lighting, and material curation.",
    description: "Interior architecture is more than just decoration; it is the manipulation of spatial volume.\n\nWe specialize in 'Turnkey Solutions' where every detail—from the acoustic properties of the ceiling to the tactile finish of the joinery—is curated by our studio. We focus on creating a sensory experience that feels both expansive and intimate.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000",
    heroAltText: "Luxury interior lounge with smoked glass partitions and marble flooring"
  },
  {
    id: "s3",
    name: "Landscape Intervention",
    slug: "landscape-intervention",
    serviceType: "Exterior Design",
    startingPrice: "Starting at $5,000",
    metaDescription: "Blurring the lines between interior living and the raw natural landscape.",
    description: "Our landscape protocol treats the exterior as a natural extension of the architectural shell.\n\nBy utilizing drought-resistant local flora and custom-built water features, we create outdoor sanctuaries that provide seasonal beauty. We emphasize the use of stone and timber to create a seamless transition between the built environment and the earth.",
    image: "https://images.unsplash.com/photo-1558603668-6570496b66f8?q=80&w=1964",
    heroAltText: "Minimalist garden design with stone pathways and architectural plants"
  }
];