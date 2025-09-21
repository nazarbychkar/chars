"use client";

import { useAppContext } from "@/lib/GeneralProvider";

export default function WhyChooseUs() {
  const { isDark } = useAppContext();

  const info = [
    {
      pic: "https://placehold.co/589x334",
      top_text: "Власне виробництво",
      bottom_text:
        "Ми контролюємо кожен етап — від викрійки до останнього стібка.",
    },
    {
      pic: "https://placehold.co/589x334",
      top_text: "Пошиття під індивідуальні параметри",
      bottom_text:
        "Ми не створюємо “середньостатистичний” одяг — ми створюємо твій.",
    },
    {
      pic: "https://placehold.co/589x334",
      top_text: "Створення образу за 24 години",
      bottom_text:
        "У нас немає “довгого очікування” — є уважність до твого часу.",
    },
    {
      pic: "https://placehold.co/589x334",
      top_text: "Якість котру відчуваєш",
      bottom_text:
        "Кожен виріб проходить через руки майстра, а не лише машину.",
    },
    {
      pic: "https://placehold.co/589x334",
      top_text: "Локальний український бренд",
      bottom_text:
        "Ми підтримуємо локальне виробництво, чесну працю та створюємо речі, які говорять тихо, але точно.",
    },
  ];

  return (
    <section
      // h-[2659px]
      className={`max-w-[1920px] mx-auto w-full relative ${
        isDark ? "" : "bg-[#e3dfd7]"
      } overflow-hidden`}
    >
      <div className="flex justify-between items-center m-10">
        <div className=" text-center justify-center  text-5xl font-normal font-['Inter'] uppercase">
          Чому обирають нас
        </div>
        <div className=" justify-center opacity-70 text-xl font-normal font-['Inter'] capitalize leading-normal">
          Chars — коли естетика не потребує зайвих слів.
        </div>
      </div>

      <div className="flex flex-col p-10">
        {info.map((item, i) => (
          <div key={i} className="border-y">
            <div className="flex justify-between items-center m-15">
              <img
                className="w-[589px] h-80"
                src={item.pic}
                alt={`image-${i}`}
              />

              <div className="w-[509px] justify-center text-5xl font-normal font-['Inter'] lowercase">
                {item.top_text} <br />
                <span className="justify-center text-xl font-normal font-['Inter'] capitalize">
                  {item.bottom_text}
                </span>
              </div>

              <div className="text-center justify-center text-4xl font-normal font-['Inter'] lowercase">
                {`0${i + 1}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
