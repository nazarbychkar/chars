"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import Link from "next/link";

export default function SocialMedia() {
  const { isDark } = useAppContext();

  return (
    // h-[977px]
    <section
      id="contacts"
      className="max-w-[1920px] mx-auto w-full  relative overflow-hidden m-36"
    >
      <div className="flex justify-center">
        <div className="flex justify-center gap-7">
          <img
            className="w-80 h-[700.25px] rounded-[46.43px]"
            src="https://placehold.co/323x700"
          />
          {/* <img className="w-96 h-[725.39px]" src="https://placehold.co/352x725" /> */}
          <img
            className="w-80 h-[709.92px] rounded-[53.20px]"
            src="https://placehold.co/327x710"
          />
          {/* <img className="w-96 h-[725.39px]" src="https://placehold.co/352x725" /> */}
        </div>

        <div className="flex flex-col gap-10 ml-25 m-18">
          <div className="flex flex-col">
            <span className="text-stone-500 text-8xl font-normal font-['Inter']">
              Ми ближче,{" "}
            </span>
            <span className="text-8xl font-normal font-['Inter']">
              ніж здається!
            </span>
          </div>

          <div className="w-[465px] justify-center text-3xl font-normal font-['Inter'] capitalize leading-9">
            Лімітована колекція — для тих кому важлива унікальність.
          </div>

          <div className="flex justify-between w-115 items-center">
            <Link
              href="https://www.tiktok.com/"
              className={`w-80 h-16 text-center flex items-center ${
                isDark ? "bg-stone-100 text-black" : "bg-stone-900 text-white "
              } justify-center text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight`}
            >
              МИ В TIKTOK
            </Link>
            <img className="w-10 h-10" src="https://placehold.co/39x39" />
          </div>

          <div className="flex justify-between items-center w-115">
            <Link
              href="https://www.instagram.com/"
              className={`w-80 h-16 text-center flex items-center ${
                isDark ? "bg-stone-100 text-black" : "bg-stone-900 text-white "
              } justify-center text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight`}
            >
              МИ В ІНСТАГРАМ
            </Link>
            <img className="w-10 h-10" src="https://placehold.co/39x39" />
          </div>
        </div>
      </div>
    </section>
  );
}
