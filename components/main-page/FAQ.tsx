"use client";

import { useState } from "react";

export default function FAQ() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <section id="payment-and-delivery" className="bg-[#e3dfd7] py-20">
      <div className="flex justify-between m-10">
        <div className="w-96 h-72 relative">
          <div className="w-96 h-44 justify-center text-7xl font-medium font-['Montserrat'] leading-[74.69px]">
            Ви часто
            <br />
            запитуєте
          </div>
          <div className="w-96 h-14 justify-cente text-2xl font-normal font-['Arial'] leading-loose">
            Зібрали найпоширеніші
            <br />
            запитання наших відвідувачів
          </div>
        </div>

        <div>
          {[
            { number: "01", title: "Оплата | CHARS KYIV", content: "Штани з корегуванням параметрів" },
            { number: "02", title: "Доставка | CHARS KYIV", content: "Штани з корегуванням параметрів" },
            { number: "03", title: "Повернення | CHARS KYIV", content: "Штани з корегуванням параметрів" },
            { number: "04", title: "Відправка замовлення | CHARS KYIV", content: "Штани з корегуванням параметрів" },
          ].map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center border-b-2 p-5">
                <div className="flex justify-around items-center gap-10">
                  <div className="w-10 h-8 justify-center text-4xl font-normal font-['Arial'] leading-9">
                    {item.number}
                  </div>
                  <div
                    onClick={() => toggleAccordion(index + 1)}
                    className="w-[765px] h-16 justify-center text-3xl font-normal font-['Arial'] leading-loose cursor-pointer"
                  >
                    {item.title}
                  </div>
                </div>
                <div className="w-10 h-10 justify-center text-4xl font-normal font-['Arial'] leading-9">
                  {openAccordion === index + 1 ? "-" : "+"}
                </div>
              </div>

              {/* Accordion content with smooth transition */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openAccordion === index + 1 ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="p-5 w-[608px] justify-center text-xl font-normal font-['Arial'] leading-normal">
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
