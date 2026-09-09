"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useBasket } from "@/lib/BasketProvider";
import { buildProductSlug } from "@/lib/slug";

interface RecommendedProduct {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  price: number | string;
  price_eur?: number | string | null;
  discount_percentage?: number | string | null;
  first_media?: { url: string; type: string } | null;
}

interface BasketCrossSellProps {
  productIds: number[];
  isDark?: boolean;
  /** Compact layout for sidebar cart */
  compact?: boolean;
  onNavigate?: () => void;
  limit?: number;
}

export default function BasketCrossSell({
  productIds,
  isDark = false,
  compact = false,
  onNavigate,
  limit = 4,
}: BasketCrossSellProps) {
  const { withLocalePath, messages, locale } = useI18n();
  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) === "EUR";

  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const idsKey = useMemo(
    () =>
      [...new Set(productIds.filter((id) => Number.isInteger(id) && id > 0))]
        .sort((a, b) => a - b)
        .join(","),
    [productIds]
  );

  useEffect(() => {
    if (!idsKey) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/products/recommendations?product_ids=${idsKey}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.products) ? data.products : [];
        const exclude = new Set(idsKey.split(",").map(Number));
        const filtered = list.filter(
          (p: RecommendedProduct) => !exclude.has(p.id)
        );
        if (!cancelled) setProducts(filtered.slice(0, limit));
      } catch (error) {
        console.warn("Basket cross-sell failed to load", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [idsKey, limit]);

  if (loading || products.length === 0) return null;

  return (
    <div
      className={
        compact
          ? "border-t pt-4 mt-2"
          : "w-full border border-stone-200 rounded p-4 md:p-5"
      }
    >
      <div
        className={`font-medium uppercase tracking-[0.08em] ${
          compact ? "text-sm mb-3" : "text-base md:text-lg mb-4"
        }`}
      >
        {messages.basket.boughtWithThisTitle}
      </div>

      <div
        className={
          compact
            ? "flex flex-col gap-3"
            : "grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4"
        }
      >
        {products.map((product) => {
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
          const symbol = isEuro ? "€" : "₴";
          const discountPct = Number(product.discount_percentage);
          const hasDiscount = Number.isFinite(discountPct) && discountPct > 0;
          const salePrice = hasDiscount
            ? basePrice * (1 - discountPct / 100)
            : basePrice;
          const href = withLocalePath(
            `/product/${buildProductSlug(product.name, product.id)}`
          );
          const isVideo = product.first_media?.type === "video";

          return (
            <Link
              key={product.id}
              href={href}
              onClick={onNavigate}
              className={
                compact
                  ? `flex gap-3 items-center rounded-md p-2 transition-colors ${
                      isDark ? "hover:bg-stone-800" : "hover:bg-white/70"
                    }`
                  : "flex flex-col gap-2 group"
              }
            >
              <div
                className={
                  compact
                    ? "relative h-16 w-12 shrink-0 overflow-hidden bg-stone-200"
                    : "relative aspect-[2/3] w-full overflow-hidden bg-stone-200"
                }
              >
                {isVideo && product.first_media ? (
                  <video
                    src={`/api/images/${product.first_media.url}`}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    loop
                    autoPlay
                    preload="metadata"
                  />
                ) : product.first_media ? (
                  <Image
                    src={getProductImageSrc(
                      product.first_media,
                      "https://placehold.co/200x300"
                    )}
                    alt={displayName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes={compact ? "48px" : "(max-width: 640px) 45vw, 160px"}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
                    {messages.product.imagePlaceholder}
                  </div>
                )}
              </div>

              <div className={compact ? "min-w-0 flex-1" : ""}>
                <div
                  className={`capitalize leading-snug ${
                    compact
                      ? "text-sm line-clamp-2"
                      : "text-sm md:text-base line-clamp-2 min-h-[2.5rem]"
                  }`}
                >
                  {displayName}
                </div>
                <div
                  className={`mt-1 ${compact ? "text-sm" : "text-sm md:text-base"}`}
                >
                  {hasDiscount ? (
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">
                        {salePrice.toFixed(2)}
                        {symbol}
                      </span>
                      <span className="opacity-40 line-through">
                        {basePrice}
                        {symbol}
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium">
                      {basePrice}
                      {symbol}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
