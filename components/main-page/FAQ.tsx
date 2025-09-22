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
          <div>
            <div className="flex justify-between items-center border-b-2 p-5">
              <div className="flex justify-around items-center gap-10">
                <div className="w-10 h-8 justify-center text-4xl font-normal font-['Arial'] leading-9">
                  01
                </div>
                <div
                  onClick={() => toggleAccordion(1)}
                  className=" w-[765px] h-16 justify-center text-3xl font-normal font-['Arial'] leading-loose"
                >
                  Оплата | CHARS KYIV
                </div>
              </div>
              <div className="w-10 h-10 justify-center text-4xl font-normal font-['Arial'] leading-9">
                +
              </div>
            </div>
            {openAccordion == 1 && (
              <div className="p-5 w-[608px] justify-center text-xl font-normal font-['Arial'] leading-normal">
                Штани з корегуванням параметрів
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
            )}
          </div>

          <div>
            <div className="flex justify-between items-center border-b-2 p-5">
              <div className="flex justify-around items-center gap-10">
                <div className="w-10 h-8 justify-center text-4xl font-normal font-['Arial'] leading-9">
                  02
                </div>
                <div
                  onClick={() => toggleAccordion(2)}
                  className=" w-[765px] h-16 justify-center text-3xl font-normal font-['Arial'] leading-loose"
                >
                  Доставка | CHARS KYIV
                </div>
              </div>
              <div className="w-10 h-10 justify-center text-4xl font-normal font-['Arial'] leading-9">
                +
              </div>
            </div>
            {openAccordion == 2 && (
              <div className="p-5 w-[608px] justify-center text-xl font-normal font-['Arial'] leading-normal">
                Штани з корегуванням параметрів
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
            )}
          </div>

          <div>
            <div className="flex justify-between items-center border-b-2 p-5">
              <div className="flex justify-around items-center gap-10">
                <div className="w-10 h-8 justify-center text-4xl font-normal font-['Arial'] leading-9">
                  03
                </div>
                <div
                  onClick={() => toggleAccordion(3)}
                  className=" w-[765px] h-16 justify-center text-3xl font-normal font-['Arial'] leading-loose"
                >
                  Повернення | CHARS KYIV
                </div>
              </div>
              <div className="w-10 h-10 justify-center text-4xl font-normal font-['Arial'] leading-9">
                +
              </div>
            </div>
            {openAccordion == 3 && (
              <div className="p-5 w-[608px] justify-center text-xl font-normal font-['Arial'] leading-normal">
                Штани з корегуванням параметрів
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
            )}
          </div>

          <div>
            <div className="flex justify-between items-center border-b-2 p-5">
              <div className="flex justify-around items-center gap-10">
                <div className="w-10 h-8 justify-center text-4xl font-normal font-['Arial'] leading-9">
                  04
                </div>
                <div
                  onClick={() => toggleAccordion(4)}
                  className=" w-[765px] h-16 justify-center text-3xl font-normal font-['Arial'] leading-loose"
                >
                  Відправка замовлення | CHARS KYIV
                </div>
              </div>
              <div className="w-10 h-10 justify-center text-4xl font-normal font-['Arial'] leading-9">
                +
              </div>
            </div>
            {openAccordion == 4 && (
              <div className="p-5 w-[608px] justify-center text-xl font-normal font-['Arial'] leading-normal">
                Штани з корегуванням параметрів
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
