"use client";

import { useAppContext } from "@/lib/GeneralProvider";

export default function FinalCard() {
  const { isDark } = useAppContext();

  return (
    <section className="max-w-[1922px] w-full mx-auto relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
        <div className="mt-10 text-center sm:text-left text-3xl sm:text-6xl font-normal font-['Inter'] leading-snug sm:leading-[64.93px] mb-5">
          Заповніть всі поля
        </div>

        <div className="w-full sm:w-1/4"></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
        <form action="" className="flex flex-col gap-5 w-full sm:w-1/3">
          <label
            htmlFor="name"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Ім’я
          </label>
          <input
            type="text"
            id="name"
            placeholder="Ваше імʼя"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
          />

          <label
            htmlFor="email"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            placeholder="Ваш Email"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
          />

          <label
            htmlFor="phone"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Телефон
          </label>
          <input
            type="text"
            id="phone"
            placeholder="Ваш телефон"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
          />

          <label
            htmlFor="comment"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Коментар
          </label>
          <input
            type="text"
            id="comment"
            placeholder="Ваш коментар"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
          />

          <button
            className={`${
              isDark ? "bg-white text-black" : "bg-black text-white"
            } p-4 sm:p-5 rounded mt-3 font-semibold`}
            type="submit"
          >
            Відправити
          </button>
        </form>

        <div className="flex flex-col w-full sm:w-auto ">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="w-full sm:w-auto self-stretch h-auto sm:h-48 relative rounded p-4 flex flex-col sm:flex-row gap-4 sm:gap-3 items-center">
              <img
                className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded"
                src="https://placehold.co/114x160"
                alt="product"
              />
              <div className="flex flex-col flex-1 gap-1">
                <div className="text-base font-normal font-['Inter'] leading-normal">
                  LIMITED Виварені спортивні худі
                </div>
                <div className="text-zinc-600 text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                  3,380.00 ₴
                </div>
                <div className="text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                  S
                </div>

                <div className="flex justify-start items-center gap-3 mt-auto">
                  <div className="w-20 h-9 border border-neutral-400/60 flex justify-around items-center rounded">
                    <button className="text-zinc-500 text-base font-normal font-['Inter'] leading-normal">+</button>
                    <div className="text-base font-normal font-['Inter'] leading-normal">1</div>
                    <button className="text-zinc-500 text-base font-normal font-['Inter'] leading-normal">-</button>
                  </div>
                  <button className="text-red-500 font-semibold">trash</button>
                </div>
              </div>
            </div>
          ))}

          <div className="p-5 border-t flex justify-between text-base sm:text-2xl font-normal font-['Arial']">
            <div>Всього</div>
            <div className="font-['Helvetica'] leading-relaxed tracking-wide">
              3,380.00 ₴
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
