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
      className={`site-shell relative ${
        isDark ? "" : "bg-[#eef7ff]"
      } overflow-hidden`}
    >
      <div className="site-px flex flex-col lg:flex-row lg:justify-between items-start lg:items-center gap-3 py-10">
        <div className="font-display text-3xl lg:text-5xl font-medium tracking-[0.03em]">
          {messages.home.whyChooseUsTitle}
        </div>
        <div className="opacity-70 text-base lg:text-xl font-normal leading-normal">
          {messages.home.whyChooseUsSubtitle}
        </div>
      </div>

      <div className="site-px flex flex-col pb-10">
        {info.map((item, i) => (
          <div
            key={i}
            // ref={itemRef(i)}
            className="border-y"
          >
            <div className="flex justify-between gap-3 sm:gap-5 py-5 lg:py-10">
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-15 items-center">
                <div className="relative w-full max-w-[589px] aspect-[589/320] shrink-0 overflow-hidden">
                  <Image
                    className="object-cover"
                    src={item.pic}
                    alt={`image-${i}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 589px"
                    quality={i < 2 ? 85 : 75}
                    loading={i < 2 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
                <div className="w-full justify-center text-xl sm:text-3xl lg:text-5xl font-normal">
                  {item.top_text} <br />
                  <span className="justify-center text-sm sm:text-lg lg:text-xl font-normal">
                    {item.bottom_text}
                  </span>
                </div>
              </div>

              <div className="text-center justify-center text-xl sm:text-2xl lg:text-4xl font-normal lowercase">
                {`0${i + 1}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
