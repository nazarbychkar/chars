/**
 * Custom hook for fetching and caching products
 */

import { useState, useEffect } from "react";
import { cachedFetch, CACHE_KEYS } from "./cache";

interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_de?: string | null;
  price: number;
  price_eur?: number | null;
  discount_percentage?: number;
  media?: { url: string; type: string }[];
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
  colors?: { label: string; hex?: string | null }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string;
  category_name?: string;
  has_lining?: boolean;
  lining_description?: string;
  fabric_composition?: string;
}

interface UseProductsOptions {
  category?: string | null;
  season?: string | null;
  subcategory?: string | null;
  topSale?: boolean;
  limitedEdition?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, season, subcategory, topSale, limitedEdition } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        let url = "/api/products";
        let cacheKey = CACHE_KEYS.PRODUCTS;

        if (topSale) {
          url = "/api/products/top-sale";
          cacheKey = "products_top_sale";
        } else if (limitedEdition) {
          url = "/api/products/limited-edition";
          cacheKey = "products_limited_edition";
        } else if (subcategory) {
          url = `/api/products/subcategory?subcategory=${encodeURIComponent(
            subcategory
          )}`;
          cacheKey = CACHE_KEYS.PRODUCTS_SUBCATEGORY(subcategory);
        } else if (category) {
          url = `/api/products/category?category=${encodeURIComponent(category)}`;
          cacheKey = CACHE_KEYS.PRODUCTS_CATEGORY(category);
        } else if (season) {
          url = `/api/products/season?season=${encodeURIComponent(season)}`;
          cacheKey = CACHE_KEYS.PRODUCTS_SEASON(season);
        }

        // For global list (used in search) не кешуємо довго, щоб одразу бачити нові товари
        const isBaseList = cacheKey === CACHE_KEYS.PRODUCTS;
        const duration = isBaseList ? 0 : undefined;

        const data = await cachedFetch<Product[]>(url, cacheKey, duration);
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, season, subcategory, topSale, limitedEdition]);

  return { products, loading, error };
}

export function useProduct(id: number | string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await cachedFetch<Product>(
          `/api/products/${id}`,
          CACHE_KEYS.PRODUCT(Number(id))
        );
        setProduct(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  return { product, loading, error };
}

