"use client";

import { useAppContext } from "@/lib/Provider";
import { Montserrat } from "next/font/google";
import Link from "next/link";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function Footer() {
  const { isDark } = useAppContext();

  return (
    <footer className="mt-50 m-10 h-[764px] relative overflow-hidden flex flex-col justify-between">
      <div className="w-full mx-1 h-52">
        <div
          className={` ${montserrat.className} left-[9px] top-[-20px] absolute justify-center text-[209px] leading-[207.94px] tracking-[50px] border-b`}
        >
          CHARS KYIV
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex justify-start gap-4">
            <div className="w-26 h-26 rounded-full border-1 flex items-center justify-center" />
            <div className="w-56 h-11 text-xl flex justify-start my-3">
              Адреса шоуруму:
              <br />
              Київ, вул. Костянтинівська, 21
            </div>
          </div>

          <div className="flex justify-start gap-4">
            <div className="w-26 h-26 rounded-full border-1 flex items-center justify-center" />
            <div className="w-56 h-5  text-xl flex justify-start my-auto">
              charskyiev91@gmail.com
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-start gap-4">
            <div className="w-26 h-26 rounded-full border-1 flex items-center justify-center" />
            <div className="w-32 h-11 text-xl flex justify-start my-auto">
              Instagram
            </div>
          </div>

          <div className="flex justify-start gap-4">
            <div className="w-26 h-26 rounded-full border-1 flex items-center justify-center" />
            <div className="w-32 h-5  text-xl flex justify-start my-auto">
              Facebook
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-22">
          <div className="flex justify-start gap-4">
            {/* <div className="w-28 h-28 rounded-full border-1 flex items-center justify-center" /> */}
            <div className="w-56 h-11  flex flex-col justify-start my-auto">
              <span className="text-2xl">Графік роботи:</span>
              <span className="text-lg">Пн-Пт 13:00-19:00</span>
            </div>
          </div>

          <div className="flex justify-start gap-4">
            {/* <div className="w-28 h-28 rounded-full border-1 flex items-center justify-center" /> */}
            <div className="w-56 h-11  flex flex-col justify-start my-auto">
              <span className="text-2xl">Телефон</span>
              <span className="text-lg">+380 5086 730 48</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-2xl">Навігація</span>
          <Link href="/#about" className="text-lg">
            Про нас
          </Link>
          <Link href="/#payment-and-delivery" className="text-lg">
            Оплата і доставка
          </Link>
          <Link href="/#reviews" className="text-lg">
            Відгуки
          </Link>
          <Link href="/#contacts" className="text-lg">
            Контакти
          </Link>
        </div>

        <Link
          href="/#"
          className={`w-60 h-60 rounded-full flex justify-center ${
            isDark ? "bg-stone-100" : "bg-stone-900"
          }`}
        >
          <span
            className={`my-auto text-2xl ${
              isDark ? "text-stone-900" : "text-stone-100"
            }`}
          >
            На головну
          </span>
        </Link>
      </div>

      <div className="flex justify-between">
        <span className="text-xl text-stone-100">
          Chars Kyiv © 2025 All rights reserved
        </span>
        <span className="text-xl text-stone-100">
          Політика конфінденційності
        </span>
      </div>
    </footer>
  );
}
