"use client";

import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useBasket } from "@/lib/BasketProvider";
import { buildProductSlug } from "@/lib/slug";

function VideoWithAutoplay({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      const playVideo = async () => {
        try {
          await video.play();
        } catch {
          setTimeout(async () => {
            try {
              await video.play();
            } catch {
              // ignore
            }
          }, 200);
        }
      };

      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener("loadeddata", playVideo, { once: true });
        video.addEventListener("canplay", playVideo, { once: true });
        video.load();
      }
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted
      playsInline
      autoPlay
      preload="metadata"
    />
  );
}

interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  price: number;
  price_eur?: number | null;
  discount_percentage?: number | null;
  first_media?: { url: string; type: string } | null;
}

interface TopSaleClientProps {
  products: Product[];
}

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

function getDisplayName(
  product: Product,
  locale: string
): string {
  if (locale === "en") return product.name_en || product.name;
  if (locale === "de") return product.name_de || product.name;
  return product.name;
}

export default function TopSaleClient({ products }: TopSaleClientProps) {
  const { locale, messages, withLocalePath } = useI18n();
  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) === "EUR";

  if (products.length === 0) {
    return (
      <div className="text-center py-10">{messages.home.topSaleSubtitle}</div>
    );
  }

  const limitedProducts = products.slice(0, 4);

  return (
    <section className="site-shell relative my-10 md:my-16">
      <div className="site-px flex flex-col gap-10">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between border-b-2 py-10">
          <div className="text-left font-display text-4xl md:text-5xl font-medium tracking-[0.03em]">
            {messages.home.topSaleTitle}
          </div>
          <div className="opacity-70 text-base md:text-xl font-normal capitalize leading-normal">
            {messages.home.topSaleSubtitle}
          </div>
        </div>

        {/* Mobile — same card layout as Limited Edition */}
        <div className="sm:hidden -mr-4 lg:-mr-8 xl:-mr-12">
          <Swiper
            spaceBetween={12}
            slidesPerView={1.35}
            centeredSlides={false}
            grabCursor
            slidesOffsetAfter={16}
            breakpoints={{
              320: { slidesPerView: 1.25, spaceBetween: 10 },
              480: { slidesPerView: 1.4, spaceBetween: 12 },
            }}
          >
            {limitedProducts.map((product, index) => {
              const displayName = getDisplayName(product, locale);
              const basePrice =
                isEuro && product.price_eur != null
                  ? Number(product.price_eur)
                  : Number(product.price);
              const currencySymbol = isEuro ? "€" : "₴";

              return (
                <SwiperSlide key={product.id}>
                  <Link
                    href={withLocalePath(
                      `/product/${buildProductSlug(product.name, product.id)}`
                    )}
                    className="w-full group space-y-5"
                  >
                    <div className="relative w-full h-[500px]">
                      {product.first_media?.type === "video" ? (
                        <VideoWithAutoplay
                          src={`/api/images/${product.first_media.url}`}
                          className="object-cover group-hover:brightness-90 transition duration-300 w-full h-full"
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
                          sizes="90vw"
                          priority={index === 0}
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-left text-xl font-normal capitalize leading-normal">
                        {displayName}
                      </div>
                      <div className="text-left text-xl font-normal leading-none mt-1">
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
        </div>

        {/* Desktop — same card layout as Limited Edition */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {limitedProducts.map((product, index) => {
            const displayName = getDisplayName(product, locale);
            const basePrice =
              isEuro && product.price_eur != null
                ? Number(product.price_eur)
                : Number(product.price);
            const currencySymbol = isEuro ? "€" : "₴";

            return (
              <Link
                href={withLocalePath(
                  `/product/${buildProductSlug(product.name, product.id)}`
                )}
                key={product.id}
                className="group space-y-4 sm:space-y-5 w-full"
              >
                <div className="aspect-[2/3] w-full overflow-hidden relative">
                  {product.first_media?.type === "video" ? (
                    <VideoWithAutoplay
                      src={`/api/images/${product.first_media.url}`}
                      className="object-cover group-hover:brightness-90 transition duration-300 w-full h-full"
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
                      priority={index < 2}
                    />
                  )}
                </div>

                <div>
                  <div className="text-center text-base sm:text-lg md:text-xl font-normal capitalize leading-normal">
                    {displayName}
                  </div>
                  <div className="text-center text-base sm:text-lg font-normal leading-none mt-1">
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
