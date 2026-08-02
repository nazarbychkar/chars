"use client";

import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useBasket } from "@/lib/BasketProvider";
import { buildProductSlug } from "@/lib/slug";

// Video component with proper mobile autoplay
function VideoWithAutoplay({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      
      const playVideo = async () => {
        try {
          await video.play();
        } catch {
          // Retry after delay for mobile (silently fail if still blocked)
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
        video.addEventListener('loadeddata', playVideo, { once: true });
        video.addEventListener('canplay', playVideo, { once: true });
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
      <div className={`mt-1 flex flex-wrap items-center gap-1.5 ${alignClass}`}>
        <span className="font-medium opacity-100">
          {salePrice.toFixed(2)}
          {currencySymbol}
        </span>
        <span className="opacity-40 line-through text-base">
          {basePrice.toLocaleString()}
          {currencySymbol}
        </span>
        <span className="text-xs tracking-wide opacity-55">
          −{discountPct}%
        </span>
      </div>
    );
  }

  return (
    <>
      {basePrice.toLocaleString()} {currencySymbol}
    </>
  );
}

export default function TopSaleClient({ products }: TopSaleClientProps) {
  const { locale, messages, withLocalePath } = useI18n();
  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) === "EUR";
  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        {messages.home.topSaleSubtitle}
      </div>
    );
  }

  const limitedProducts = products.slice(0, 4);

  return (
    <section className="site-shell mb-24 md:mb-35 relative overflow-hidden flex flex-col gap-10">
      <div className="site-px border-b-2 pb-10 flex flex-col lg:flex-row justify-between mt-16 lg:mt-20 lg:items-center gap-3">
        <div className="font-display text-3xl lg:text-5xl font-medium tracking-[0.03em]">
          {messages.home.topSaleTitle}
        </div>
        <div className="text-left opacity-70 text-base lg:text-xl font-normal capitalize leading-normal">
          {messages.home.topSaleSubtitle}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 site-px">
        {limitedProducts.map((product, index) => {
          const displayName =
            locale === "en"
              ? product.name_en || product.name
              : locale === "de"
              ? product.name_de || product.name
              : product.name;
          const basePrice =
            isEuro && product.price_eur != null ? product.price_eur : product.price;
          const currencySymbol = isEuro ? "€" : "₴";

          return (
            <Link
              href={withLocalePath(
                `/product/${buildProductSlug(product.name, product.id)}`
              )}
              key={product.id}
              className="flex flex-col gap-3 group w-full"
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
                    "https://placehold.co/432x613"
                  )}
                  alt={displayName}
                  fill
                  sizes="(max-width: 420px) 90vw, (max-width: 640px) 45vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  priority={index < 2} // Only first 2 images get priority for mobile
                  loading={index < 2 ? undefined : "lazy"}
                  quality={index < 4 ? 85 : 75} // Higher quality for first 4, lower for others
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              )}
            </div>

            <div className="text-center text-base sm:text-lg md:text-xl font-normal capitalize leading-normal">
              {displayName}
              <br />
              <ProductPrice
                basePrice={Number(basePrice)}
                currencySymbol={currencySymbol}
                discountPercentage={product.discount_percentage}
              />
            </div>
          </Link>
        );
        })}
      </div>

      {/* Mobile swiper carousel — left-aligned, peek next card */}
      <div className="sm:hidden pl-4 lg:pl-8 xl:pl-12">
        <Swiper
          modules={[Navigation]}
          spaceBetween={12}
          slidesPerView={1.35}
          centeredSlides={false}
          grabCursor
          slidesOffsetAfter={16}
        >
          {limitedProducts.map((product, index) => {
            const displayName =
              locale === "en"
                ? product.name_en || product.name
                : locale === "de"
                ? product.name_de || product.name
                : product.name;
            const basePrice =
              isEuro && product.price_eur != null ? product.price_eur : product.price;
            const currencySymbol = isEuro ? "€" : "₴";

            return (
              <SwiperSlide key={product.id}>
                <Link
                  href={withLocalePath(
                    `/product/${buildProductSlug(product.name, product.id)}`
                  )}
                  className="relative flex flex-col gap-3 group"
                >
                <div className="relative w-full h-[350px]">
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
                        "https://placehold.co/432x613"
                      )}
                      alt={displayName}
                      fill
                      sizes="70vw"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      quality={index === 0 ? 90 : 70}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  )}
                </div>
                <div className="text-left text-lg font-normal capitalize leading-normal">
                  {displayName}
                  <br />
                  <ProductPrice
                    basePrice={Number(basePrice)}
                    currencySymbol={currencySymbol}
                    discountPercentage={product.discount_percentage}
                    align="left"
                  />
                </div>
              </Link>
            </SwiperSlide>
          );
          })}
        </Swiper>
      </div>
    </section>
  );
}
