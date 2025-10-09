"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";


interface Product {
  id: number;
  name: string;
  price: number;
  top_sale: boolean;
  media: { type: string; url: string }[];
}

export default function TopSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.filter((p: Product) => p.top_sale)); // Only top_sale products
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Завантаження...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-10">Наразі немає топових товарів.</div>;
  }

  return (
    <section className="max-w-[1920px] mx-auto w-full mb-35 relative overflow-hidden flex flex-col gap-10">
      <div className="border-b-2 pb-10 flex flex-col lg:flex-row justify-between mt-20 mx-10 lg:items-center">
        <div className="lg:text-center justify-center text-2xl lg:text-5xl font-normal font-['Inter'] uppercase">
          Топ продажів | CHARS
        </div>
        <div className="text-left opacity-70 text-base lg:text-xl font-normal font-['Inter'] capitalize leading-normal">
          Улюблені образи наших клієнтів.
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 px-6">
        {products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="flex flex-col gap-3 group w-full"
          >
            <div className="aspect-[2/3] w-full overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:brightness-90 transition duration-300"
                src={(() => {
                  const firstPhoto = product.media?.find((m) => m.type === "photo");
                  const imageUrl = firstPhoto?.url || product.media?.[0]?.url;
                  return imageUrl ? `/api/images/${imageUrl}` : "https://placehold.co/432x613";
                })()}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/432x613/cccccc/666666?text=No+Image";
                }}
                alt={product.name}
              />
            </div>

            <div className="text-center text-base sm:text-lg md:text-xl font-normal font-['Inter'] capitalize leading-normal">
              {product.name} <br />
              {product.price.toLocaleString()} ₴
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile swiper carousel */}
      <div className="sm:hidden">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1.5}
          centeredSlides
          grabCursor
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <Link
                href={`/product/${product.id}`}
                className="relative flex flex-col gap-3 group"
              >
                <img
                  className="w-full h-[350px] object-cover group-hover:brightness-90 transition duration-300"
                  src={(() => {
                    const firstPhoto = product.media?.find((m) => m.type === "photo");
                    const imageUrl = firstPhoto?.url || product.media?.[0]?.url;
                    return imageUrl ? `/api/images/${imageUrl}` : "https://placehold.co/432x613";
                  })()}
                  alt={product.name}
                />
                <div className="justify-center text-lg font-normal font-['Inter'] capitalize leading-normal text-center">
                  {product.name} <br />
                  {product.price.toLocaleString()} ₴
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
