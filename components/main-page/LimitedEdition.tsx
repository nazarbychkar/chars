"use client";

import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useBasket } from "@/lib/BasketProvider";
import { buildProductSlug } from "@/lib/slug";

interface LimitedProduct {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  price: number;
  price_eur?: number | null;
  discount_percentage?: number | null;
  first_media?: { type: string; url: string } | null;
  limited_edition?: boolean;
}

const templateProduct: LimitedProduct = {
  id: -1,
  name: "Шовкова сорочка без рукавів",
  name_en: null,
  name_de: null,
  price: 1780,
  price_eur: null,
  discount_percentage: null,
  first_media: { type: "photo", url: "template-placeholder" },
  limited_edition: false,
};

function ProductPrice({
  basePrice,
  currencySymbol,
  discountPercentage,
  align = "center",
}: {
  basePrice: number;
  currencySymbol: string;
  discountPercentage?: number | null;
  align?: "center" | "left";
}) {
  const discountPct = Number(discountPercentage);
  const hasDiscount = Number.isFinite(discountPct) && discountPct > 0;
  const alignClass = align === "left" ? "justify-start" : "justify-center";

  if (hasDiscount) {
    const salePrice = basePrice * (1 - discountPct / 100);
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${alignClass}`}>
        <span className="font-medium">
          {salePrice.toFixed(2)}
          {currencySymbol}
        </span>
        <span className="opacity-40 line-through text-base">
          {basePrice.toLocaleString()}
          {currencySymbol}
        </span>
        <span className="text-xs tracking-wide opacity-55">−{discountPct}%</span>
      </div>
    );
  }

  return (
    <>
      {basePrice.toLocaleString()} {currencySymbol}
    </>
  );
}

function getDisplayName(product: LimitedProduct, locale: string): string {
  if (locale === "en") return product.name_en || product.name;
  if (locale === "de") return product.name_de || product.name;
  return product.name;
}

function getBasePrice(product: LimitedProduct, isEuro: boolean): number {
  return isEuro && product.price_eur != null
    ? Number(product.price_eur)
    : Number(product.price);
}

export default function LimitedEdition() {
  const { products: limitedEditionProducts, loading } = useProducts({
    limitedEdition: true,
  });
  const { messages, withLocalePath, locale } = useI18n();
  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) === "EUR";

  const products: LimitedProduct[] = useMemo(() => {
    const filled =
      limitedEditionProducts.length < 8
        ? [
            ...limitedEditionProducts,
            ...Array(8 - limitedEditionProducts.length).fill(templateProduct),
          ]
        : limitedEditionProducts;

    return filled.slice(0, 4) as LimitedProduct[];
  }, [limitedEditionProducts]);

  if (loading) {
    return (
      <div className="text-center py-10">{messages.common.loading}</div>
    );
  }

  return (
    <section className="site-shell relative my-10 md:my-16">
      <div className="site-px flex flex-col gap-10">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between border-b-2 py-10">
          <div className="text-left font-display text-4xl md:text-5xl font-medium tracking-[0.03em]">
            {messages.home.limitedTitle}
          </div>
          <div className="opacity-70 text-base md:text-xl font-normal capitalize leading-normal">
            {messages.home.limitedSubtitle}
          </div>
        </div>

        {/* Mobile layout: Two stacked sliders — left-aligned */}
        <div className="sm:hidden -mr-4 lg:-mr-8 xl:-mr-12">
          {[0, 1].map((slider) => (
            <Swiper
              key={slider}
              spaceBetween={12}
              slidesPerView={1.35}
              centeredSlides={false}
              grabCursor={true}
              initialSlide={0}
              slidesOffsetAfter={16}
              breakpoints={{
                320: { slidesPerView: 1.25, spaceBetween: 10 },
                480: { slidesPerView: 1.4, spaceBetween: 12 },
              }}
            >
              {products.map((product, i) => {
                const displayName = getDisplayName(product, locale);
                const basePrice = getBasePrice(product, isEuro);
                const currencySymbol = isEuro ? "€" : "₴";

                return (
                  <SwiperSlide
                    key={`${slider}-${product.id !== -1 ? product.id : `template-${i}`}`}
                  >
                    <Link
                      href={withLocalePath(
                        `/product/${
                          product.id === -1
                            ? product.id
                            : buildProductSlug(product.name, product.id)
                        }`
                      )}
                      className="w-full group space-y-5"
                    >
                      <div className="relative w-full h-[500px]">
                        <Image
                          className="object-cover group-hover:brightness-90 transition duration-300"
                          src={getProductImageSrc(
                            product.first_media,
                            "https://placehold.co/432x682"
                          )}
                          alt={displayName}
                          fill
                          sizes="90vw"
                        />
                      </div>
                      <div>
                        <div className="text-left text-xl font-normal capitalize leading-normal">
                          {displayName}
                        </div>
                        <div className="mt-1 text-left text-xl font-normal leading-none">
                          <ProductPrice
                            basePrice={basePrice}
                            currencySymbol={currencySymbol}
                            discountPercentage={product.discount_percentage}
                            align="left"
                          />
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {products.map((product, i) => {
            const displayName = getDisplayName(product, locale);
            const basePrice = getBasePrice(product, isEuro);
            const currencySymbol = isEuro ? "€" : "₴";

            return (
              <Link
                href={withLocalePath(
                  `/product/${
                    product.id === -1
                      ? product.id
                      : buildProductSlug(product.name, product.id)
                  }`
                )}
                key={product.id !== -1 ? product.id : `template-${i}`}
                className="group space-y-4 sm:space-y-5 w-full"
              >
                <div className="aspect-[2/3] w-full overflow-hidden relative">
                  {product.first_media?.type === "video" ? (
                    <video
                      src={`/api/images/${product.first_media.url}`}
                      className="object-cover group-hover:brightness-90 transition duration-300 w-full h-full"
                      loop
                      muted
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      className="object-cover group-hover:brightness-90 transition duration-300"
                      src={getProductImageSrc(
                        product.first_media,
                        "https://placehold.co/432x682"
                      )}
                      alt={displayName}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  )}
                </div>

                <div>
                  <div className="text-center text-base sm:text-lg md:text-xl font-normal capitalize leading-normal">
                    {displayName}
                  </div>
                  <div className="mt-1 text-center text-base sm:text-lg font-normal leading-none">
                    <ProductPrice
                      basePrice={basePrice}
                      currencySymbol={currencySymbol}
                      discountPercentage={product.discount_percentage}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
