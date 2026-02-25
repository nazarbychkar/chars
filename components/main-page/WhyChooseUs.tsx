 "use client";

import { useAppContext } from "@/lib/GeneralProvider";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";
// import { useState, useEffect, useRef } from "react";

// TODO: somehow with this optimizations images didn't load on first load,
// need to fix this, cause optimization is as valuable as these pictures.

export default function WhyChooseUs() {
  const { isDark } = useAppContext();
  const { messages } = useI18n();

  const info = [
    {
      pic: "/images/IMG_0043.JPG",
      top_text: messages.home.whyChooseUsItems[0].top,
      bottom_text: messages.home.whyChooseUsItems[0].bottom,
    },
    {
      pic: "/images/IMAGE-2025-10-17_21-48-37.jpg",
      top_text: messages.home.whyChooseUsItems[1].top,
      bottom_text: messages.home.whyChooseUsItems[1].bottom,
    },
    {
      pic: "/images/IMG_0045.JPG",
      top_text: messages.home.whyChooseUsItems[2].top,
      bottom_text: messages.home.whyChooseUsItems[2].bottom,
    },
    {
      pic: "/images/IMAGE-2025-10-17_21-48-55.jpg",
      top_text: messages.home.whyChooseUsItems[3].top,
      bottom_text: messages.home.whyChooseUsItems[3].bottom,
    },
    {
      pic: "/images/IMG_0042.JPG",
      top_text: messages.home.whyChooseUsItems[4].top,
      bottom_text: messages.home.whyChooseUsItems[4].bottom,
    },
  ];

  // Intersection Observer for progressive loading
  // useEffect(() => {
  //   observerRef.current = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const index = parseInt(
  //             entry.target.getAttribute("data-index") || "0"
  //           );
  //           setVisibleItems((prev) => new Set([...prev, index]));
  //         }
  //       });
  //     },
  //     {
  //       rootMargin: "50px 0px", // Start loading 50px before entering viewport
  //       threshold: 0.1,
  //     }
  //   );

  //   return () => {
  //     if (observerRef.current) {
  //       observerRef.current.disconnect();
  //     }
  //   };
  // }, []);

  // const itemRef = (index: number) => (el: HTMLDivElement | null) => {
  //   if (el && observerRef.current) {
  //     el.setAttribute("data-index", index.toString());
  //     observerRef.current.observe(el);
  //   }
  // };

  return (
    <section
      // h-[2659px]
      className={`max-w-[1920px] mx-auto w-full relative ${
        isDark ? "" : "bg-[#e3dfd7]"
      } overflow-hidden`}
    >
      <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center m-10">
        <div className="text-start lg:text-center justify-center text-3xl lg:text-5xl font-normal font-['Inter'] uppercase">
          {messages.home.whyChooseUsTitle}
        </div>
        <div className=" justify-center opacity-70 lg:text-xl font-normal font-['Inter'] leading-normal">
          {messages.home.whyChooseUsSubtitle}
        </div>
      </div>

      <div className="flex flex-col p-4 sm:p-10">
        {info.map((item, i) => (
          <div
            key={i}
            // ref={itemRef(i)}
            className="border-y"
          >
            <div className="flex justify-between gap-3 sm:gap-5 m-3 sm:m-5 lg:m-15">
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-15 items-center">
                <Image
                  className="w-full md:w-[589px] md:h-80 object-cover"
                  src={item.pic}
                  alt={`image-${i}`}
                  width={589}
                  height={320}
                  sizes="(max-width: 420px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 70vw, 589px"
                  quality={i < 2 ? 85 : 75} // Higher quality for first 2 images
                  loading={i < 2 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <div className="w-full justify-center text-xl sm:text-3xl lg:text-5xl font-normal font-['Inter']">
                  {item.top_text} <br />
                  <span className="justify-center text-sm sm:text-lg lg:text-xl font-normal font-['Inter']">
                    {item.bottom_text}
                  </span>
                </div>
              </div>

              <div className="text-center justify-center text-xl sm:text-2xl lg:text-4xl font-normal font-['Inter'] lowercase">
                {`0${i + 1}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
