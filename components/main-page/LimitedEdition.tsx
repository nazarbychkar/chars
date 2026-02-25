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
  first_media?: { type: string; url: string } | null;
  limited_edition?: boolean;
}

// Define a fallback (template) product
const templateProduct: LimitedProduct = {
  id: -1,
  name: "Шовкова сорочка без рукавів",
  name_en: null,
  name_de: null,
  price: 1780,
  price_eur: null,
  first_media: { type: "photo", url: "template-placeholder" },
  limited_edition: false,
};

export default function LimitedEdition() {
  const { products: limitedEditionProducts, loading } = useProducts({
    limitedEdition: true,
  });
  const { messages, withLocalePath, locale } = useI18n();
  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) === "EUR";

  // Fill with template products if there are not enough
  const products: LimitedProduct[] = useMemo(() => {
    // Fill up to 8 first (so we still get templates if needed)
    const filled =
      limitedEditionProducts.length < 8
        ? [
            ...limitedEditionProducts,
            ...Array(8 - limitedEditionProducts.length).fill(templateProduct),
          ]
        : limitedEditionProducts;

    // ✅ Then limit to 4
    return filled.slice(0, 4) as LimitedProduct[];
  }, [limitedEditionProducts]);

  if (loading) {
    return (
      <div className="text-center py-10">{messages.common.loading}</div>
    );
  }

  return (
    <section className="max-w-[1920px] w-full mx-auto relative m-10">
      <div className="flex flex-col m-10 gap-10">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between border-b-2 py-10">
          <div className="text-left justify-center text-5xl font-normal font-['Inter'] uppercase">
            {messages.home.limitedTitle}
          </div>
          <div className="justify-center opacity-70 text-xl font-normal font-['Inter'] capitalize leading-normal">
            {messages.home.limitedSubtitle}
          </div>
        </div>

        {/* Mobile layout: Two stacked sliders */}
        <div className="sm:hidden">
          {/* First Slider */}
          <Swiper
            spaceBetween={12}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            initialSlide={0}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 8 },
              480: { slidesPerView: 1.5, spaceBetween: 12 },
            }}
          >
            {products.map((product, i) => {
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
              const currencySymbol = isEuro ? "€" : "₴";

              return (
                <SwiperSlide
                  key={product.id !== -1 ? product.id : `template-${i}`}
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
                      <div className="text-xl font-normal font-['Inter'] capitalize leading-normal text-center">
                        {displayName}
                      </div>
                      <div className="text-xl font-normal font-['Inter'] leading-none text-center">
                        {basePrice.toLocaleString()} {currencySymbol}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Second Slider */}
          <Swiper
            spaceBetween={12}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            initialSlide={0}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 8 },
              480: { slidesPerView: 1.5, spaceBetween: 12 },
            }}
          >
            {products.map((product, i) => {
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
              const currencySymbol = isEuro ? "€" : "₴";

              return (
                <SwiperSlide
                  key={product.id !== -1 ? product.id : `template-${i}`}
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
                      <div className="text-xl font-normal font-['Inter'] capitalize leading-normal text-center">
                        {displayName}
                      </div>
                      <div className="text-xl font-normal font-['Inter'] leading-none text-center">
                        {basePrice.toLocaleString()} {currencySymbol}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Desktop layout: 4x2 Grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {products.map((product, i) => {
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
                  <div className="text-center text-base sm:text-lg md:text-xl font-normal font-['Inter'] capitalize leading-normal">
                    {displayName}
                  </div>
                  <div className="text-center text-base sm:text-lg font-normal font-['Inter'] leading-none">
                    {basePrice.toLocaleString()} {currencySymbol}
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
