"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

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
  const { locale, messages } = useI18n();

  // Auto-generate breadcrumbs if not provided
  const autoItems: BreadcrumbItem[] =
    items && items.length
      ? items
      : (() => {
      const paths = pathname.split("/").filter(Boolean);

      // Skip leading locale segment (en/de/uk) in the visible breadcrumb path
      const visiblePaths =
        paths.length > 0 &&
        SUPPORTED_LOCALES.includes(
          paths[0] as (typeof SUPPORTED_LOCALES)[number]
        )
          ? paths.slice(1)
          : paths;
      const breadcrumbs: BreadcrumbItem[] = [
        {
          label: messages.breadcrumbs.homeLabel,
          href: locale === "uk" ? "/uk" : `/${locale}`,
        },
      ];

      let currentPath = "";
      visiblePaths.forEach((path, index) => {
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

  // Normalize / localize provided items (especially for product page)
  const breadcrumbItems: BreadcrumbItem[] = autoItems.map((item, index, arr) => {
    // First item is always "home"
    if (index === 0) {
      return {
        ...item,
        label: messages.breadcrumbs.homeLabel,
        href: locale === "uk" ? "/uk" : `/${locale}`,
      };
    }

    // "Catalog" link
    if (item.href === "/catalog" || item.href.endsWith("/catalog")) {
      const catalogLabelByLocale: Record<string, string> = {
        uk: "Каталог",
        en: "Catalog",
        de: "Katalog",
      };
      return {
        ...item,
        label: catalogLabelByLocale[locale] ?? item.label,
      };
    }

    // Last crumb can use productName override if provided
    const isLast = index === arr.length - 1;
    if (isLast && productName) {
      return { ...item, label: productName };
    }

    return item;
  });

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
                    aria-label={messages.breadcrumbs.goToAria(item.label)}
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

