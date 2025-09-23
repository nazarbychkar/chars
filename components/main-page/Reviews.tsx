"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import { useAppContext } from "@/lib/GeneralProvider";

export default function Reviews() {
  const { isDark } = useAppContext();

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <section
      id="reviews"
      className={`max-w-[1920px] w-full mx-auto h-[871px] relative ${
        isDark ? "bg-stone-900" : "bg-[#e3dfd7]"
      } px-8`}
    >
      {/* Top section */}
      <div className="flex justify-between items-end pt-15 ">
        <div className="w-[632.70px] text-7xl font-medium font-['Montserrat'] leading-[74.69px]">
          Враження
          <br />
          наших клієнтів
        </div>

        <div className="text-2xl font-normal font-['Arial'] leading-relaxed">
          Більше відгуків дивіться у<br />
          нашому <span className="underline italic">Instagram</span> профілі
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          <button
            ref={prevRef}
            className="text-5xl font-bold text-zinc-700 cursor-pointer"
          >
            &lt;
          </button>
          <button
            ref={nextRef}
            className="text-5xl font-bold text-zinc-700 cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Swiper Carousel */}
      <div className="mt-12 w-full">
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={4.5}
          loop
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onInit={(swiper) => {
            if (
              typeof swiper.params.navigation !== "boolean" &&
              swiper.params.navigation
            ) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
        >
          {[
            {
              title: "Відгук 1",
              text: "Сервіс на найвищому рівні. Рекомендую всім!",
            },
            {
              title: "Відгук 2",
              text: "Дуже задоволена досвідом! Обов’язково повернусь.",
            },
            {
              title: "Відгук 3",
              text: "Прекрасна атмосфера та професійний підхід.",
            },
            {
              title: "Відгук 4",
              text: "Все було чудово! Персонал дуже уважний.",
            },
            {
              title: "Відгук 5",
              text: "Комфортно і затишно. Буду радити друзям!",
            },
            { title: "Відгук 6", text: "Це місце — справжня знахідка!" },
          ].map((review, i) => (
            <SwiperSlide key={i}>
              <div className="h-[640px] bg-neutral-500 p-6 text-white flex flex-col justify-center items-center rounded-xl">
                <h3 className="text-2xl font-bold mb-4">{review.title}</h3>
                <p className="text-lg text-center max-w-[80%]">{review.text}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
