"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  productName?: string;
}

export default function Breadcrumbs({ items, productName }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems: BreadcrumbItem[] =
    items ||
    (() => {
      const paths = pathname.split("/").filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [{ label: "Головна", href: "/" }];

      let currentPath = "";
      paths.forEach((path, index) => {
        currentPath += `/${path}`;
        const label =
          index === paths.length - 1 && productName
            ? productName
            : path
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        breadcrumbs.push({ label, href: currentPath });
      });

      return breadcrumbs;
    })();

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <li key={item.href} className="flex items-center">
              {!isLast ? (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    aria-label={`Перейти до ${item.label}`}
                  >
                    {item.label}
                  </Link>
                  <span
                    className="mx-2 text-gray-400"
                    aria-hidden="true"
                  >
                    /
                  </span>
                </>
              ) : (
                <span
                  className="text-black dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// JSON-LD Schema for breadcrumbs
export function BreadcrumbsSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${typeof window !== "undefined" ? window.location.origin : ""}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
