import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sqlGetProduct } from "@/lib/sql";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BreadcrumbsSchema from "@/components/shared/BreadcrumbsSchema";
import { ProductPageSkeleton } from "@/components/shared/Skeleton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 300; // ISR every 5 minutes

// Generate static params for popular products
export async function generateStaticParams() {
  try {
    const { sqlGetAllProducts } = await import("@/lib/sql");
    const products = await sqlGetAllProducts();
    
    // Generate static pages for all products (or limit to top N)
    return products.slice(0, 50).map((product: { id: number }) => ({
      id: String(product.id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate dynamic metadata for product pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';
  
  try {
    const products = await sqlGetProduct(Number(id));
    const product = products[0];
    
    if (!product) {
      return {
        title: "Товар не знайдено | CHARS",
        description: "Товар не знайдено",
      };
    }

    const productName = product.name || "Товар";
    const productDescription = product.description 
      ? `${product.description.substring(0, 155)}...`
      : `${productName} від CHARS — український бренд чоловічого одягу. Висока якість, стильний дизайн. Замовляйте онлайн з доставкою по Україні.`;
    
    const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)) || 0;
    const oldPrice = product.old_price ? (typeof product.old_price === 'number' ? product.old_price : parseFloat(String(product.old_price)) || null) : null;
    const discount = product.discount_percentage ? (typeof product.discount_percentage === 'number' ? product.discount_percentage : parseFloat(String(product.discount_percentage)) || 0) : 0;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
    
    const media = product.media || [];
    const imageUrl = getFirstProductImage(media);
    const fullImageUrl = imageUrl ? `${baseUrl}/api/images/${imageUrl}` : `${baseUrl}/images/light-theme/chars-logo-header-light.png`;
    
    const category = product.category_name || "";
    const subcategory = product.subcategory_name || "";
    const season = product.season || "";
    
    const keywords = [
      productName,
      "CHARS",
      "чоловічий одяг",
      "український бренд",
      category,
      subcategory,
      season,
      "купити онлайн",
      "доставка по Україні"
    ].filter(Boolean).join(", ");

    return {
      title: `${productName} | CHARS — Український Бренд Чоловічого Одягу`,
      description: productDescription,
      keywords,
      alternates: {
        canonical: `${baseUrl}/product/${id}`,
      },
      openGraph: {
        title: `${productName} | CHARS`,
        description: productDescription,
        type: "website",
        url: `${baseUrl}/product/${id}`,
        siteName: "CHARS",
        locale: "uk_UA",
        images: [
          {
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: productName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${productName} | CHARS`,
        description: productDescription,
        images: [fullImageUrl],
      },
      other: {
        "product:price:amount": Number(finalPrice).toFixed(2),
        "product:price:currency": "UAH",
        ...(oldPrice && typeof oldPrice === 'number' && { "product:original_price:amount": Number(oldPrice).toFixed(2) }),
        ...(oldPrice && typeof oldPrice === 'number' && { "product:original_price:currency": "UAH" }),
        ...(discount > 0 && { "product:discount": `${discount}%` }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata for product:", error);
    return {
      title: "Товар | CHARS",
      description: "Сторінка товару CHARS — український бренд чоловічого одягу",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';
  
  // Get product for breadcrumbs
  let productName = "Товар";
  try {
    const products = await sqlGetProduct(Number(id));
    if (products[0]) {
      productName = products[0].name || "Товар";
    }
  } catch (error) {
    console.error("Error fetching product for breadcrumbs:", error);
  }

  const breadcrumbItems = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: productName, href: `/product/${id}` },
  ];
  
  return (
    <main>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <Breadcrumbs items={breadcrumbItems} productName={productName} />
        <BreadcrumbsSchema items={breadcrumbItems} baseUrl={baseUrl} />
      </div>
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductServer id={id} />
      </Suspense>
      <YouMightLike />
    </main>
  );
}
