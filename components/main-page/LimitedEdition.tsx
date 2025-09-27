"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";

export default function LimitedEdition() {
  return (
    <section className="max-w-[1920px] w-full mx-auto h-[3067px] relative overflow-hidden m-10">
      <div className="flex flex-col m-10 gap-10">
        <div className="flex justify-between border-b-2 py-10">
          <div className="text-center justify-center text-5xl font-normal font-['Inter'] uppercase">
            Лімітована колекція від CHARS
          </div>
          <div className="justify-center opacity-70 text-xl font-normal font-['Inter'] capitalize leading-normal">
            Лімітована колекція — для тих кому важлива унікальність.
          </div>
        </div>

        {/* Mobile layout: Two stacked sliders */}
        <div className="sm:hidden">
          {/* First Slider */}
          <Swiper
            spaceBetween={16}
            slidesPerView={1.5} // Show 1.5 slides on mobile
            centeredSlides // Center the first slide with part of the second visible
            grabCursor={true} // Allow swipe action
            initialSlide={0} // Start from the first slide
          >
            {Array.from({ length: 8 }, (_, i) => (
              <SwiperSlide key={i}>
                <Link
                  href="/product"
                  className="w-96 h-[682px] group space-y-5"
                >
                  <img
                    className="w-96 h-[600px] group-hover:filter group-hover:brightness-90 transition brightness duration-300"
                    src="https://placehold.co/432x682"
                  />
                  <div>
                    <div className="justify-center text-xl font-normal font-['Inter'] capitalize leading-normal ">
                      шовкова сорочка без рукавів
                    </div>
                    <div className="w-24 h-4 justify-center text-xl font-normal font-['Inter'] leading-none">
                      1,780.00 ₴
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Second Slider */}
          <Swiper
            spaceBetween={16}
            slidesPerView={1.5} // Show 1.5 slides on mobile
            centeredSlides // Center the first slide with part of the second visible
            grabCursor={true} // Allow swipe action
            initialSlide={0} // Start from the first slide
          >
            {Array.from({ length: 8 }, (_, i) => (
              <SwiperSlide key={i}>
                <Link
                  href="/product"
                  className="w-96 h-[682px] group space-y-5"
                >
                  <img
                    className="w-96 h-[600px] group-hover:filter group-hover:brightness-90 transition brightness duration-300"
                    src="https://placehold.co/432x682"
                  />
                  <div>
                    <div className="justify-center text-xl font-normal font-['Inter'] capitalize leading-normal ">
                      шовкова сорочка без рукавів
                    </div>
                    <div className="w-24 h-4 justify-center text-xl font-normal font-['Inter'] leading-none">
                      1,780.00 ₴
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop layout: Grid view */}
        <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-10">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="w-96 h-[682px] group space-y-5">
              <img
                className="w-96 h-[600px] group-hover:filter group-hover:brightness-90 transition brightness duration-300"
                src="https://placehold.co/432x682"
              />
              <div>
                <div className="justify-center text-xl font-normal font-['Inter'] capitalize leading-normal ">
                  шовкова сорочка без рукавів
                </div>
                <div className="w-24 h-4 justify-center text-xl font-normal font-['Inter'] leading-none">
                  1,780.00 ₴
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="relative w-full sm:w-[600px] md:w-[700px] lg:w-[894px] h-[600px] sm:h-[800px] md:h-[1000px] lg:h-[1279px]">
            <img
              src="https://placehold.co/894x1279"
              className="w-full h-full object-cover"
              alt="Product Background"
            />

            <div className="absolute bottom-1/12 left-1/2 transform -translate-x-1/2">
              <div className="w-80 h-16 p-2 bg-white flex justify-center items-center gap-2">
                <div className="text-center text-black text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
                  більше товарів
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-[600px] md:w-[700px] lg:w-[894px] h-[600px] sm:h-[800px] md:h-[1000px] lg:h-[1279px]">
            <img
              src="https://placehold.co/894x1279"
              className="w-full h-full object-cover"
              alt="Product Background"
            />

            <div className="absolute bottom-1/12 left-1/2 transform -translate-x-1/2">
              <div className="w-80 h-16 p-2 bg-white flex justify-center items-center gap-2">
                <div className="text-center text-black text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
                  більше товарів
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
