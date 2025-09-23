"use client";

import { useAppContext } from "@/lib/GeneralProvider";

export default function FinalCard() {
  const { isDark } = useAppContext();

  return (
    // h-[1093px]
    <section className="max-w-[1922px] w-full mx-auto relative overflow-hidden">
      <div className="flex justify-center gap-50">
        <div className="m-10 justify-center text-6xl font-normal font-['Inter'] leading-[64.93px] mb-5">
          Заповніть всі поля
        </div>

        <div className="w-1/4"></div>
      </div>

      <div className="flex justify-center gap-50">
        <form action="" className="flex flex-col gap-5 w-1/3">
          <label
            htmlFor="name"
            className="justify-center text-2xl font-normal font-['Arial']"
          >
            Ім’я
          </label>
          <input
            type="text"
            id="name"
            placeholder="Ваше імʼя"
            className="border justify-center text-stone-900/60 text-xl font-normal font-['Arial'] p-5"
          />

          <label
            htmlFor="email"
            className="justify-center text-2xl font-normal font-['Arial']"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            placeholder="Ваш Email"
            className="border justify-center text-stone-900/60 text-xl font-normal font-['Arial'] p-5"
          />

          <label
            htmlFor="phone"
            className="justify-center text-2xl font-normal font-['Arial'] "
          >
            Телефон
          </label>
          <input
            type="text"
            id="phone"
            placeholder="Ваш телефон"
            className="border justify-center text-stone-900/60 text-xl font-normal font-['Arial'] p-5"
          />

          <label
            htmlFor="comment"
            className="justify-center text-2xl font-normal font-['Arial'] "
          >
            Коментар
          </label>
          <input
            type="text"
            id="comment"
            placeholder="Ваш коментар"
            className="border justify-center text-stone-900/60 text-xl font-normal font-['Arial'] p-5"
          />

          <button
            className={`${
              isDark ? "bg-white text-black" : "bg-black text-white"
            } p-5`}
            type="submit"
          >
            Відправити
          </button>
        </form>

        <div className="flex flex-col">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="self-stretch h-48 relative">
              <div className="flex justify-center gap-3">
                <img className="w-28 h-40" src="https://placehold.co/114x160" />
                <div className="flex flex-col">
                  <div className="justify-center text-base font-normal font-['Inter'] leading-normal">
                    LIMITED Виварені спортивні худі
                  </div>
                  <div className="justify-center text-zinc-600 text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                    3,380.00 ₴
                  </div>
                  <div className="justify-center text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                    S
                  </div>

                  <div className="flex justify-start items-center gap-3">
                    <div className="w-20 h-9 border border-neutral-400/60 flex justify-around items-center">
                      <div className="justify-center text-zinc-500 text-base font-normal font-['Inter'] leading-normal">
                        +
                      </div>
                      <div className=" justify-center text-base font-normal font-['Inter'] leading-normal">
                        1
                      </div>
                      <div className="justify-center text-zinc-500 text-base font-normal font-['Inter'] leading-normal">
                        -
                      </div>
                    </div>
                    <div className="text-red-500">trash</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="p-5 border-t flex justify-between">
            <div className="justify-center text-2xl font-normal font-['Arial']">
              Всього
            </div>
            <div className="justify-center text-2xl font-normal font-['Helvetica'] leading-relaxed tracking-wide">
              3,380.00 ₴
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
