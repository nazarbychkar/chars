"use client";

import { useAppContext } from "@/lib/GeneralProvider";

export default function Product() {
  const { isDark } = useAppContext();

  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
        {/* Image Section */}
        <div className="relative flex justify-center">
          <img
            className="w-full "
            src="https://placehold.co/800x1160"
            alt="product"
          />
          <button className="text-4xl md:text-6xl absolute top-4 left-4">
            {"<"}
          </button>
          <button className="text-4xl md:text-6xl absolute top-4 right-4">
            {">"}
          </button>
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-6 md:gap-10 px-4 md:px-0">
          {/* Availability */}
          <div className="text-lg md:text-xl font-normal font-['Helvetica'] leading-relaxed tracking-wide">
            В наявності
          </div>

          {/* Product Name */}
          <div className="text-4xl md:text-6xl lg:text-7xl font-normal font-['Inter'] capitalize leading-tight">
            Спортивні штани(039)
          </div>

          {/* Price Section */}
          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-5 gap-2">
            <div className="text-red-500 text-xl md:text-2xl font-['Helvetica']">
              3,380.00 ₴
            </div>
            <div className="text-xl md:text-2xl font-['Helvetica'] line-through">
              3,380.00 ₴
            </div>
          </div>

          {/* Size Picker Title */}
          <div className="text-lg md:text-2xl font-['Inter'] uppercase tracking-tight">
            Оберіть розмір
          </div>

          {/* Size Options */}
          <div className="flex flex-wrap gap-3">
            {["xl", "l", "m", "s", "xs"].map((size) => (
              <div
                key={size}
                className="w-16 sm:w-20 md:w-24 p-2 sm:p-4 border flex justify-center text-lg md:text-xl font-['Inter'] uppercase"
              >
                {size}
              </div>
            ))}
          </div>

          {/* Add to Cart Button */}
          <div
            className={`w-full sm:w-auto text-center ${
              isDark ? "bg-white text-black" : "bg-black text-white"
            } p-3 text-xl md:text-2xl font-medium font-['Inter'] uppercase tracking-tight`}
          >
            в кошик
          </div>

          {/* Description Section */}
          <div className="w-full md:w-[522px]">
            <div className="mb-3 md:mb-5 text-2xl md:text-3xl font-['Inter'] uppercase tracking-tight">
              опис
            </div>
            <div className="text-base md:text-2xl font-['Inter'] leading-relaxed tracking-wide">
              Базова сорочка з шифону на ґудзиках. Колір шоколадний. Склад
              тканини: 80% віскоза, 20% шовк. Розміри S,M,L,XL. Виготовлено в
              Україні. Сезоність: літо, осінь, весна, зима
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
