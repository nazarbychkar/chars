import ProductClientWrapper from "./ProductClientWrapper";
import { notFound } from "next/navigation";
import { sqlGetProduct } from "@/lib/sql";
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/seo";
import { extractProductIdFromParam } from "@/lib/slug";

interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  price: number;
  price_eur?: number | null;
  old_price?: number;
  discount_percentage?: number;
  description?: string;
  description_en?: string | null;
  description_de?: string | null;
  media?: { url: string; type: string }[];
  sizes?: { size: string; stock: string }[];
  colors?: { label: string; hex?: string | null }[];
  fabric_composition?: string;
  fabric_composition_en?: string | null;
  fabric_composition_de?: string | null;
  has_lining?: boolean;
  lining_description?: string;
  lining_description_en?: string | null;
  lining_description_de?: string | null;
  category_name?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const numericId = extractProductIdFromParam(id);
    if (!numericId) return null;

    const products = await sqlGetProduct(numericId);
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://charsua.com';
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
