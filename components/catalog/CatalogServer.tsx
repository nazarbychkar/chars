import CatalogClient from "./CatalogClient";
import {
  sqlGetAllProducts,
  sqlGetProductsByCategory,
  sqlGetProductsBySeason,
  sqlGetProductsBySubcategoryName,
  sqlGetAllColors,
  sqlGetAllCategories,
  sqlGetAllSubcategories,
} from "@/lib/sql";
import { buildCategorySlug, buildSubcategorySlug } from "@/lib/slug";

interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  price: number;
  price_eur?: number | null;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
}

interface CatalogServerProps {
  category?: string | null;
  season?: string | null;
  subcategory?: string | null;
}

async function getProducts(params: CatalogServerProps): Promise<Product[]> {
  const { category, season, subcategory } = params;
  
  try {
    if (subcategory) {
      const allSubs = await sqlGetAllSubcategories();
      const key = subcategory.toLowerCase();
      const matched = allSubs.find((s: { name?: string }) => {
        const baseName = (s.name || "") as string;
        const slug = buildSubcategorySlug(baseName);
        return (
          baseName.toLowerCase() === key ||
          slug.toLowerCase() === key
        );
      });
      const nameForDb = matched ? (matched.name as string) : subcategory;
      return await sqlGetProductsBySubcategoryName(nameForDb);
    } else if (category) {
      const allCats = await sqlGetAllCategories();
      const key = category.toLowerCase();
      const matched = allCats.find((c: { name?: string }) => {
        const baseName = (c.name || "") as string;
        const slug = buildCategorySlug(baseName);
        return (
          baseName.toLowerCase() === key ||
          slug.toLowerCase() === key
        );
      });
      const nameForDb = matched ? (matched.name as string) : category;
      return await sqlGetProductsByCategory(nameForDb);
    } else if (season) {
      return await sqlGetProductsBySeason(season);
    }
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getColors(): Promise<string[]> {
  try {
    const data = await sqlGetAllColors();
    return data.map((item: { color: string }) => item.color);
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
}

export default async function CatalogServer(props: CatalogServerProps) {
  // Parallel data fetching for better performance
  const [products, colors] = await Promise.all([
    getProducts(props),
    getColors(),
  ]);

  return <CatalogClient initialProducts={products} colors={colors} />;
}

