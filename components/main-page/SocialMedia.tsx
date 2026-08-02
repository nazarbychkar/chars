"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { siteContact } from "@/lib/siteContact";

export default function SocialMedia() {
  const { isDark } = useAppContext();
  const { messages } = useI18n();

  return (
    // h-[977px]
    <section
      id="contacts"
      className="scroll-mt-30 site-shell site-px relative overflow-hidden my-16 lg:my-36"
    >
      <div className="flex flex-col-reverse lg:flex-row justify-between items-center gap-10 lg:gap-16">
        <div className="flex justify-center gap-4 sm:gap-7 overflow-x-auto w-full lg:w-auto">
          <Image
            className="w-44 h-auto sm:w-80 sm:h-auto rounded-[24px] sm:rounded-[46.43px] max-w-full max-h-[calc(100vh-20px)]"
            src="/images/social-media-0.png"
            alt="TikTok"
            width={353}
            height={726}
          />
          <Image
            className="w-44 h-auto sm:w-80 sm:h-auto rounded-[24px] sm:rounded-[53.20px] max-w-full max-h-[calc(100vh-20px)]"
            src="/images/social-media-1.png"
            alt="Instagram"
            width={353}
            height={726}
          />
        </div>

        <div className="flex flex-col gap-10 w-full lg:max-w-xl">
          <div className="flex flex-col">
            <span
              className={`font-display text-5xl lg:text-8xl font-medium tracking-[0.02em] ${
                isDark ? "text-white/40" : "text-[#072a6b]/40"
              }`}
            >
              {messages.home.socialTitleLine1}{" "}
            </span>
            <span
              className={`font-display text-5xl lg:text-8xl font-medium tracking-[0.02em] ${
                isDark ? "text-white" : "text-[#072a6b]"
              }`}
            >
              {messages.home.socialTitleLine2}
            </span>
          </div>

          <div className="border-b lg:border-0 lg:w-[465px] justify-center text-lg lg:text-2xl font-normal leading-relaxed opacity-80">
            {messages.home.socialSubtitle}
          </div>

          <div className="flex justify-start gap-10 lg:justify-between items-center w-full lg:w-115">
            <Link
              href={siteContact.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-60 h-12 md:w-80 md:h-16 text-center flex items-center ${
                isDark
                  ? "bg-[#eef7ff] text-[#072a6b]"
                  : "bg-[#072a6b] text-white"
              } justify-center text-sm md:text-lg font-medium uppercase leading-none tracking-[0.14em]`}
            >
              {messages.home.socialTikTok}
            </Link>
            <Image
              width={39}
              height={39}
              className="w-11 h-11 md:w-13 md:h-13"
              src={`/images/${
                isDark ? "dark-theme/tiktok.svg" : "light-theme/tiktok.svg"
              }`}
              alt={"tiktok icon"}
            />
          </div>

          <div className="flex justify-start gap-10 lg:justify-between items-center w-full lg:w-115 mt-4 md:mt-0">
            <Link
              href={siteContact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-60 h-12 md:w-80 md:h-16 text-center flex items-center ${
                isDark
                  ? "bg-[#eef7ff] text-[#072a6b]"
                  : "bg-[#072a6b] text-white"
              } justify-center text-sm md:text-lg font-medium uppercase leading-none tracking-[0.14em]`}
            >
              {messages.home.socialInstagram}
            </Link>
            <Image
              width={39}
              height={39}
              className="w-8 h-8 md:w-10 md:h-10"
              src={`/images/${
                isDark
                  ? "dark-theme/instagram.svg"
                  : "light-theme/instagram.svg"
              }`}
              alt={"instagram icon"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
