"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useBasket } from "@/lib/BasketProvider";
import { buildProductSlug } from "@/lib/slug";

interface YouMightLikeProps {
  productId: number;
}

export default function YouMightLike({ productId }: YouMightLikeProps) {
  const { withLocalePath, messages, locale } = useI18n();
  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) ===
    "EUR";

  interface RecommendedProduct {
    id: number;
    name: string;
    name_en?: string | null;
    name_de?: string | null;
    price: number | string;
    price_eur?: number | string | null;
    first_media?: { url: string; type: string } | null;
  }

  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/products/recommendations?product_id=${productId}`
        );
        if (!res.ok) {
          throw new Error("Failed to load recommendations");
        }
        const data = await res.json();
        const list = Array.isArray(data.products) ? data.products : [];
        // Take up to 4 items for display
        setProducts(list.slice(0, 4));
      } catch (e) {
        console.error("Failed to load recommendations", e);
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  if (loading || !products.length) return null;

  return (
    <section className="max-w-[1920px] w-full mx-auto px-4 md:px-0">
      <div className="flex flex-col gap-10">
        {/* Title */}
        <div
          className={`mx-0 md:mx-10 text-4xl md:text-7xl font-normal font-['Inter'] leading-tight md:leading-[84.91px] text-center md:text-left`}
        >
          {messages.product.recommendationsTitle}
        </div>

        {/* Products list - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:flex-wrap sm:justify-around sm:gap-8">
          {products.map((product) => {
            const isVideo = product.first_media?.type === "video";
            const displayName =
              locale === "en"
                ? product.name_en || product.name
                : locale === "de"
                ? product.name_de || product.name
                : product.name;
            const basePrice =
              isEuro && product.price_eur != null
                ? Number(product.price_eur)
                : Number(product.price);
            const currencySymbol = isEuro ? " €" : " ₴";
            
            return (
              <Link
                key={product.id}
                href={withLocalePath(
                  `/product/${buildProductSlug(product.name, product.id)}`
                )}
                className="w-full sm:w-96 relative mx-auto flex flex-col"
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-gray-200">
                  {isVideo && product.first_media ? (
                    <video
                      src={`/api/images/${product.first_media.url}`}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : product.first_media ? (
                    <Image
                      src={getProductImageSrc(
                        product.first_media,
                        "https://placehold.co/432x613"
                      )}
                      alt={product.name}
                      width={400}
                      height={600}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 420px) 45vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, 400px"
                      loading="lazy"
                      quality={75} // Lower quality for recommendations
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-center p-2">
                      {messages.product.imagePlaceholder}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm sm:text-lg lg:text-xl font-normal font-['Inter'] capitalize leading-normal text-center min-h-[44px] sm:min-h-[56px] line-clamp-2">
                  {displayName}
                </div>
                <div className="mt-1 min-h-[24px] text-lg sm:text-xl font-normal font-['Inter'] leading-none text-center">
                  <span className="inline-block min-w-[72px]">
                    {basePrice}
                    {currencySymbol}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* More products button container */}
        <div className="w-full max-w-full sm:max-w-[1824px] h-[320px] sm:h-[720px] bg-[url('/images/bg-def.png')] bg-cover bg-center relative overflow-hidden mx-auto">
          <Link
            href={withLocalePath("/catalog")}
            className="absolute bg-white inline-flex justify-center items-center gap-2 px-6 py-3 left-1/2 transform -translate-x-1/2 bottom-30 w-max sm:w-96 h-auto sm:h-20"
          >
            <div className="text-center justify-center text-black text-lg sm:text-3xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              {messages.product.moreProductsLabel}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
