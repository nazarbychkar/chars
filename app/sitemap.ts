import { MetadataRoute } from 'next'
import { sqlGetAllProducts } from '@/lib/sql'

async function getProducts() {
  try {
    const products = await sqlGetAllProducts();
    return products;
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';
  const products = await getProducts();
  const now = new Date();

  // Static pages with high priority
  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Product pages - higher priority for top sale and limited edition
  const productPages = products.map((product: { id: number; top_sale?: boolean; limited_edition?: boolean; updated_at?: Date }) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: (product.top_sale || product.limited_edition) ? 0.9 : 0.8,
  }));

  return [...staticPages, ...productPages];
}
