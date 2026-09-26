import type { MetadataRoute } from 'next';
import { PRODUCTS, COLLECTIONS, SPACES, JOURNAL_ARTICLES } from '@/data/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thuong-son-ceramic.vercel.app';
  const now = new Date();

  // 1. Static core pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/showroom`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/spaces`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. All 629+ Products
  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Collections
  const collectionRoutes: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 4. Spaces
  const spaceRoutes: MetadataRoute.Sitemap = SPACES.map((s) => ({
    url: `${baseUrl}/spaces/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 5. Journal articles
  const journalRoutes: MetadataRoute.Sitemap = JOURNAL_ARTICLES.map((a) => {
    let date = now;
    if (a.date) {
      const parsed = new Date(a.date);
      if (!isNaN(parsed.getTime())) date = parsed;
    }
    return {
      url: `${baseUrl}/journal/${a.slug}`,
      lastModified: date,
      changeFrequency: 'monthly',
      priority: 0.6,
    };
  });

  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
    ...spaceRoutes,
    ...journalRoutes,
  ];
}
