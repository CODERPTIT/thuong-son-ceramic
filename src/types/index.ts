export type MaterialType = 'Marble' | 'Stone' | 'Cement' | 'Wood' | 'Terrazzo' | 'Solid Color';

export type SurfaceType = 'Matt' | 'Polished' | 'Textured' | 'Honed' | 'Lappato' | 'Carving';

export interface Product {
  id: string;
  slug: string;
  name: string;
  code: string;
  brand: string;
  collection: string;
  collectionSlug: string;
  material: MaterialType;
  surface: SurfaceType;
  colors: string[];
  sizes: string[];
  useCases: string[];
  description: string;
  price?: string;
  images: {
    thumbnail: string;
    fullFace: string;
    closeUp?: string;
    inSpace?: string;
  };
  featured: boolean;
  new: boolean;
  technicalSpecs: {
    thickness: string;
    waterAbsorption: string;
    slipResistance: string;
    facesCount: number;
    origin: string;
    application: string;
  };
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  heroImage: string;
  material: MaterialType;
  story: string;
  productIds: string[];
  colorPalette: { name: string; hex: string }[];
  textures: string[];
  applicationSpaces: string[];
}

export interface SpaceCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  productCount: number;
  hint: string;
  recommendedSizes: string[];
  recommendedSurfaces: SurfaceType[];
  designTips: { title: string; desc: string }[];
  featuredProductSlugs: string[];
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: {
    heading?: string;
    paragraph?: string;
    quote?: string;
    image?: string;
    imageCaption?: string;
  }[];
  image: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
}

export interface BathroomSolution {
  id: string;
  title: string;
  category: string;
  description: string;
  brands: string[];
  image: string;
  features: string[];
}
