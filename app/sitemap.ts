import type { MetadataRoute } from 'next'

const BASE_URL = 'https://hassan-platform.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/guide`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/stats`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/track`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/apply`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/register`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/legal/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/legal/terms`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
  ]
}