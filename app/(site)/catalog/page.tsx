import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import Breadcrumbs, { BreadcrumbsSchema } from "@/components/shared/Breadcrumbs";
import { CatalogSkeleton } from "@/components/shared/Skeleton";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export const revalidate = 300; // ISR every 5 minutes

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';
  
  const category = params.category || "";
  const season = params.season || "";
  const subcategory = params.subcategory || "";
  
  let title = "Каталог товарів | CHARS — Український Бренд Чоловічого Одягу";
  let description = "Каталог чоловічого одягу CHARS. Стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.";
  let keywords = "CHARS, каталог, чоловічий одяг, український бренд, купити одяг, доставка по Україні";
  
  if (category) {
    title = `Каталог ${category} | CHARS`;
    description = `Каталог ${category} від CHARS. Висока якість, стильний дизайн. Замовляйте онлайн з доставкою по Україні.`;
    keywords = `CHARS, ${category}, чоловічий одяг, український бренд, купити ${category.toLowerCase()}`;
  }
  
  if (season) {
    title = `Каталог ${season} | CHARS`;
    description = `Колекція ${season} від CHARS. Стильний чоловічий одяг для ${season.toLowerCase()}. Замовляйте онлайн.`;
    keywords = `CHARS, ${season}, чоловічий одяг, сезонна колекція, український бренд`;
  }
  
  if (subcategory) {
    title = `Каталог ${subcategory} | CHARS`;
    description = `Каталог ${subcategory} від CHARS. Висока якість, стильний дизайн. Замовляйте онлайн з доставкою по Україні.`;
    keywords = `CHARS, ${subcategory}, чоловічий одяг, український бренд, купити ${subcategory.toLowerCase()}`;
  }
  
  const canonicalUrl = category || season || subcategory
    ? `${baseUrl}/catalog?${new URLSearchParams({ ...params }).toString()}`
    : `${baseUrl}/catalog`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "CHARS",
      locale: "uk_UA",
      images: [
        {
          url: `${baseUrl}/images/light-theme/chars-logo-header-light.png`,
          width: 1200,
          height: 630,
          alt: "CHARS — Український Бренд Чоловічого Одягу",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/light-theme/chars-logo-header-light.png`],
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    
    const breadcrumbItems = [
      { label: "Головна", href: "/" },
      { label: "Каталог", href: "/catalog" },
    ];
    
    return (
        <>
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
                <Breadcrumbs items={breadcrumbItems} />
                <BreadcrumbsSchema items={breadcrumbItems} />
            </div>
            <Suspense fallback={<CatalogSkeleton count={8} />}>
                <CatalogServer 
                    category={params.category || null}
                    season={params.season || null}
                    subcategory={params.subcategory || null}
                />
            </Suspense>
        </>
    );
}