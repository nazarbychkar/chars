import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sqlGetProduct } from "@/lib/sql";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BreadcrumbsSchema from "@/components/shared/BreadcrumbsSchema";
import { ProductPageSkeleton } from "@/components/shared/Skeleton";
import {
  buildProductSlug,
  extractProductIdFromParam,
} from "@/lib/slug";
import type { Locale } from "@/lib/i18n/config";
import {
  OG_LOCALE,
  getSiteUrl,
  getOgImages,
  getOgImageUrl,
  pageAlternates,
  parseLangParam,
  seoCopy,
} from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const { sqlGetAllProducts } = await import("@/lib/sql");
    const products = await sqlGetAllProducts();
    return products.map((product: { id: number; name: string }) => ({
      id: buildProductSlug(product.name, product.id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

function localizedName(
  product: {
    name: string;
    name_en?: string | null;
    name_de?: string | null;
    description?: string | null;
    description_en?: string | null;
    description_de?: string | null;
  },
  lang: Locale
) {
  const name =
    lang === "en"
      ? product.name_en || product.name
      : lang === "de"
        ? product.name_de || product.name
        : product.name;
  const description =
    lang === "en"
      ? product.description_en || product.description
      : lang === "de"
        ? product.description_de || product.description
        : product.description;
  return { name, description };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  const lang = parseLangParam(rawLang);
  const numericId = extractProductIdFromParam(id);
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();

  if (numericId === null) {
    return {
      title: copy.productNotFound,
      alternates: pageAlternates(lang, `/product/${id}`),
    };
  }

  try {
    const products = await sqlGetProduct(Number(numericId));
    const product = products[0];

    if (!product) {
      return {
        title: copy.productNotFound,
        alternates: pageAlternates(lang, `/product/${id}`),
      };
    }

    const { name: productName, description } = localizedName(product, lang);
    const slug = buildProductSlug(product.name, product.id);
    const productDescription = description
      ? `${String(description).substring(0, 155)}...`
      : copy.productFallbackDescription(productName);

    const price =
      typeof product.price === "number"
        ? product.price
        : parseFloat(String(product.price || 0)) || 0;
    const discount = product.discount_percentage
      ? typeof product.discount_percentage === "number"
        ? product.discount_percentage
        : parseFloat(String(product.discount_percentage)) || 0
      : 0;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    return {
      title: `${productName} | CHARS`,
      description: productDescription,
      alternates: pageAlternates(lang, `/product/${slug}`),
      openGraph: {
        title: `${productName} | CHARS`,
        description: productDescription,
        type: "website",
        url: `${baseUrl}/${lang}/product/${slug}`,
        siteName: "CHARS",
        locale: OG_LOCALE[lang],
        images: getOgImages(copy.ogImageAlt, baseUrl),
      },
      twitter: {
        card: "summary_large_image",
        title: `${productName} | CHARS`,
        description: productDescription,
        images: [getOgImageUrl(baseUrl)],
      },
      other: {
        "product:price:amount": Number(finalPrice).toFixed(2),
        "product:price:currency": lang === "uk" ? "UAH" : "EUR",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for product:", error);
    return {
      title: copy.breadcrumbProduct,
      alternates: pageAlternates(lang, `/product/${id}`),
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { lang: rawLang, id } = await params;
  const lang = parseLangParam(rawLang);
  const numericId = extractProductIdFromParam(id);
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();

  if (numericId === null) {
    notFound();
  }

  let productName = copy.breadcrumbProduct;
  let canonicalSlug = id;
  try {
    const products = await sqlGetProduct(numericId);
    if (products[0]) {
      const localized = localizedName(products[0], lang);
      productName = localized.name || copy.breadcrumbProduct;
      canonicalSlug = buildProductSlug(products[0].name, products[0].id);
    }
  } catch (error) {
    console.error("Error fetching product for breadcrumbs:", error);
  }

  if (canonicalSlug && id !== canonicalSlug) {
    permanentRedirect(`/${lang}/product/${canonicalSlug}`);
  }

  const breadcrumbItems = [
    { label: copy.breadcrumbHome, href: `/${lang}` },
    { label: copy.breadcrumbCatalog, href: `/${lang}/catalog` },
    { label: productName, href: `/${lang}/product/${canonicalSlug}` },
  ];

  return (
    <main>
      <div className="site-shell site-px pt-2">
        <Breadcrumbs
          items={breadcrumbItems}
          productName={productName}
          className="mb-3"
        />
        <BreadcrumbsSchema items={breadcrumbItems} baseUrl={baseUrl} />
      </div>
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductServer id={id} />
      </Suspense>
      <YouMightLike productId={numericId} />
    </main>
  );
}
