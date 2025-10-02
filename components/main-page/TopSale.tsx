"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
// TODO: add boolean in products to mark TopSale or not
export default function TopSale() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

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

      {/* Desktop layout (static grid) */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 px-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Link
            href="/product"
            key={i}
            className="flex flex-col gap-3 group w-full"
          >
            <div className="aspect-[2/3] w-full overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:brightness-90 transition duration-300"
                src="https://placehold.co/432x613"
                alt={`Product ${i}`}
              />
            </div>

            <div className="text-center text-base sm:text-lg md:text-xl font-normal font-['Inter'] capitalize leading-normal">
              шовкова сорочка без рукавів <br />
              1,780.00 ₴
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile swiper carousel */}
      <div className="sm:hidden">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1.5} // Display 1.5 slides on mobile
          centeredSlides // Center the active slide
          grabCursor // Allow grab gesture
        >
          {Array.from({ length: 4 }, (_, i) => (
            <SwiperSlide key={i}>
              <Link
                href="/product"
                className="relative flex flex-col gap-3 group"
              >
                <img
                  className="w-full h-[350px] group-hover:filter group-hover:brightness-90 transition brightness duration-300"
                  src="https://placehold.co/432x613"
                />
                <div className="justify-center text-lg font-normal font-['Inter'] capitalize leading-normal text-center">
                  шовкова сорочка без рукавів <br />
                  1,780.00 ₴
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
