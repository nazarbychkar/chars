import { MetadataRoute } from "next";
import { sqlGetAllProducts } from "@/lib/sql";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/i18n/seo";
import { buildProductSlug } from "@/lib/slug";

async function getProducts() {
  try {
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const products = await getProducts();
  const now = new Date();

  const staticPages = SUPPORTED_LOCALES.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${locale}/catalog`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/${locale}/collections`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/${locale}/certificate`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/${locale}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/${locale}/terms-of-service`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/${locale}/purchase-in-parts`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
  ]);

  const productPages = products.flatMap(
    (product: {
      id: number;
      name: string;
      top_sale?: boolean;
      limited_edition?: boolean;
      updated_at?: Date;
    }) => {
      const lastModified = product.updated_at
        ? new Date(product.updated_at)
        : now;
      const slug = buildProductSlug(product.name, product.id);
      return SUPPORTED_LOCALES.map((locale) => ({
        url: `${baseUrl}/${locale}/product/${slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: product.top_sale || product.limited_edition ? 0.9 : 0.8,
      }));
    }
  );

  return [...staticPages, ...productPages];
}
