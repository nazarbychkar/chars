// SEO utility functions for structured data (JSON-LD)

export interface ProductStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description?: string;
  image?: string[];
  brand: {
    "@type": string;
    name: string;
  };
  offers: {
    "@type": string;
    url: string;
    priceCurrency: string;
    price: string;
    availability: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: string;
  };
  sku?: string;
  category?: string;
}

export interface OrganizationStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    "@type": string;
    addressCountry: string;
    addressLocality: string;
  };
  contactPoint?: {
    "@type": string;
    telephone: string;
    contactType: string;
  };
  sameAs?: string[];
}

export interface BreadcrumbStructuredData {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateProductStructuredData(
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    old_price?: number;
    discount_percentage?: number;
    media?: { url: string; type: string }[];
    category_name?: string;
  },
  baseUrl: string
): ProductStructuredData {
  const imageUrl = product.media?.[0]?.url
    ? `${baseUrl}/api/images/${product.media[0].url}`
    : `${baseUrl}/images/light-theme/chars-logo-header-light.png`;

  const priceNum = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)) || 0;
  const discountNum = product.discount_percentage 
    ? (typeof product.discount_percentage === 'number' ? product.discount_percentage : parseFloat(String(product.discount_percentage)) || 0)
    : 0;
  const finalPrice = discountNum > 0 ? priceNum * (1 - discountNum / 100) : priceNum;

  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} від CHARS — український бренд чоловічого одягу`,
    image: [imageUrl],
    brand: {
      "@type": "Brand",
      name: "CHARS",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.id}`,
      priceCurrency: "UAH",
      price: Number(finalPrice).toFixed(2),
      availability: "https://schema.org/InStock",
      priceValidUntil: priceValidUntil.toISOString().split("T")[0],
    },
    sku: `CHARS-${product.id}`,
    category: product.category_name || "Чоловічий одяг",
  };
}

export function generateOrganizationStructuredData(
  baseUrl: string
): OrganizationStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CHARS",
    url: baseUrl,
    logo: `${baseUrl}/images/light-theme/chars-logo-header-light.png`,
    description: "CHARS — український бренд чоловічого одягу, заснований у 2023 році. Ми створюємо стильний одяг для різних чоловіків без компромісів.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "UA",
      addressLocality: "Київ",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+380-XX-XXX-XX-XX", // Update with actual phone
      contactType: "customer service",
    },
    sameAs: [
      // Add your social media links here
      // "https://www.instagram.com/chars_ua",
      // "https://t.me/chars_ua",
    ],
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
): BreadcrumbStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateWebsiteStructuredData(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CHARS",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/catalog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

