import ProductClientWrapper from "./ProductClientWrapper";
import { notFound } from "next/navigation";
import { sqlGetProduct } from "@/lib/sql";
import { generateProductStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  discount_percentage?: number;
  description?: string;
  media?: { url: string; type: string }[];
  sizes?: { size: string; stock: string }[];
  colors?: { label: string; hex?: string | null }[];
  fabric_composition?: string;
  has_lining?: boolean;
  lining_description?: string;
  category_name?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const products = await sqlGetProduct(Number(id));
    return products[0] || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

interface ProductServerProps {
  id: string;
}

export default async function ProductServer({ id }: ProductServerProps) {
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';
  const productStructuredData = generateProductStructuredData(product, baseUrl);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(
    [
      { name: "Головна", url: "/" },
      { name: "Каталог", url: "/catalog" },
      { name: product.name, url: `/product/${id}` },
    ],
    baseUrl
  );

  // Wrap ProductClient to ensure it only renders client-side after hydration
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <ProductClientWrapper product={product} />
    </>
  );
}
