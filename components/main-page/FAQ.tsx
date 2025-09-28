"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useState } from "react";

export default function FAQ() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const { isDark } = useAppContext();

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <section
      id="payment-and-delivery"
      className={`max-w-[1920px] w-full mx-auto ${
        isDark ? "bg-stone-900" : "bg-[#e3dfd7]"
      } py-10 lg:py-20`}
    >
      <div className="flex flex-col lg:flex-row justify-between m-5 lg:m-10 gap-10">
        <div className="w-full lg:w-96 lg:h-72 relative">
          <div className="text-4xl lg:text-7xl font-medium font-['Montserrat'] leading-snug lg:leading-[74.69px]">
            Ви часто
            <br />
            запитуєте
          </div>
          <div className="mt-4 text-lg lg:text-2xl font-normal font-['Arial'] leading-relaxed">
            Зібрали найпоширеніші
            <br />
            запитання наших відвідувачів
          </div>
        </div>

        <div className="max-w-4xl w-full">
          {[
            {
              number: "01",
              title: "Оплата | CHARS KYIV",
              content: "Штани з корегуванням параметрів",
            },
            {
              number: "02",
              title: "Доставка | CHARS KYIV",
              content: "Штани з корегуванням параметрів",
            },
            {
              number: "03",
              title: "Повернення | CHARS KYIV",
              content: "Штани з корегуванням параметрів",
            },
            {
              number: "04",
              title: "Відправка замовлення | CHARS KYIV",
              content: "Штани з корегуванням параметрів",
            },
          ].map((item, index) => (
            <div key={index} className="cursor-pointer" onClick={() => toggleAccordion(index + 1)}>
              <div className="max-w-4xl flex flex-row justify-between items-start sm:items-center border-b-2 p-3 sm:p-5 gap-3 sm:gap-0">
                <div className="flex justify-center gap-10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-normal font-['Arial'] leading-8">
                    {item.number}
                  </div>
                  <div className="text-lg sm:text-xl lg:text-3xl font-normal font-['Arial'] leading-relaxed max-w-full sm:max-w-[765px]">
                    {item.title}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-normal font-['Arial'] leading-8">
                  {openAccordion === index + 1 ? "-" : "+"}
                </div>
              </div>

              {/* Accordion content with smooth transition */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openAccordion === index + 1 ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="p-3 sm:p-5 text-base sm:text-lg lg:text-xl font-normal font-['Arial'] leading-relaxed max-w-full sm:max-w-[608px]">
                  {item.content}
                  <br />
                  Ми надаємо можливість легкого корегування штанів за талією та
                  довжиною. Такі вироби виготовляються виключно за попередньою
                  домовленістю та потребують 100% оплати перед початком роботи.
                  <br />
                  <br />
                  Готові колекції
                  <br />
                  Для товарів з наших колекцій доступні два варіанти оплати:
                  <br />— Передплата 300 грн (після підтвердження наявності
                  товару)
                  <br />— Повна оплата
                  <br />
                  <br />
                  Усі деталі щодо оплати уточнюються після оформлення замовлення
                  нашим менеджером.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
