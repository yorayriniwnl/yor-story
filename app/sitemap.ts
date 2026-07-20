import { MetadataRoute } from 'next';
import { getPublishedSlugs } from '../lib/reflections';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yorayriniwnl.vercel.app';
  
  const reflections = getPublishedSlugs().map((slug) => ({
    url: `${baseUrl}/reflections/${slug}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split('T')[0],
    },
    {
      url: `${baseUrl}/reflections`,
      lastModified: new Date().toISOString().split('T')[0],
    },
    ...reflections,
  ];
}
