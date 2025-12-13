// Server component for breadcrumbs JSON-LD schema
// Must be server component to avoid hydration mismatch

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export default function BreadcrumbsSchema({ 
  items, 
  baseUrl 
}: BreadcrumbsSchemaProps) {
  // Use provided baseUrl or fallback to env variable (same on server and client)
  const origin = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://chars.ua";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${origin}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

