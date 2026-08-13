"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import Link from "next/link";
import FooterBrandIcon from "@/components/layout/FooterBrandIcon";
import BrandMark from "@/components/shared/BrandMark";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Footer() {
  const { isDark } = useAppContext();
  const { locale, messages } = useI18n();

  return (
    <footer className="site-shell site-px lg:mt-20 mt-12 mb-10 h-auto relative overflow-hidden flex flex-col justify-between">
      <div className="flex w-full flex-col items-center my-10 lg:my-14 border-b border-opacity-20 pb-10 lg:pb-14">
        <Link
          href={locale === "uk" ? "/uk" : `/${locale}`}
          className="mb-6 lg:mb-8 transition-opacity hover:opacity-80"
          aria-label="CHARS"
        >
          <BrandMark size={96} className="h-[72px] w-auto lg:h-24" />
        </Link>
        <h1 className="w-full relative z-10 m-0 leading-none" aria-label="CHARS KYIV">
          <svg
            viewBox="0 0 1000 120"
            className="block w-full h-auto overflow-visible"
            preserveAspectRatio="xMidYMid meet"
            role="presentation"
            aria-hidden="true"
          >
            <text
              x="0"
              y="95"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="currentColor"
              style={{
                fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
                fontWeight: 500,
                fontSize: 110,
              }}
            >
              CHARS KYIV
            </text>
          </svg>
        </h1>
      </div>

      {/* On larger screens (PC view) */}
      <div className="hidden lg:flex justify-between items-start">
        <div className="flex flex-col gap-8">
          <div className="flex justify-start gap-6 group cursor-pointer">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                isDark ? "border-white/40 text-white group-hover:border-white" : "border-[#072a6b]/35 text-[#072a6b] group-hover:border-[#072a6b]"
              }`}
            >
              <FooterBrandIcon name="location" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
            </div>
            <Link
              href="https://maps.app.goo.gl/jJS3JdddMq6njJvb8?g_st=it"
              target="_blank"
              className="w-48 h-8 md:w-56 md:h-11 text-sm md:text-xl flex justify-start my-3 transition-all duration-300 hover:text-[#072a6b]"
            >
              {messages.footer.showroomAddressLabel}
              <br />
              {messages.footer.showroomAddressValue}
            </Link>
          </div>

          <div className="flex justify-start gap-6 group cursor-pointer">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                isDark ? "border-white/40 text-white group-hover:border-white" : "border-[#072a6b]/35 text-[#072a6b] group-hover:border-[#072a6b]"
              }`}
            >
              <FooterBrandIcon name="email" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
            </div>
            <Link
              href="mailto:Charsukrainianbrand@gmail.com"
              className="w-48 h-5 items-center md:w-56 md:h-5 text-sm md:text-xl flex justify-start my-auto transition-all duration-300 hover:text-[#072a6b]"
            >
              Charsukrainianbrand <br /> @gmail.com
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex justify-start gap-6 group cursor-pointer">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                isDark ? "border-white/40 text-white group-hover:border-white" : "border-[#072a6b]/35 text-[#072a6b] group-hover:border-[#072a6b]"
              }`}
            >
              <FooterBrandIcon name="instagram" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
            </div>
            <Link
              href="https://www.instagram.com/chars.wear/"
              target="_blank"
              className="w-28 h-8 md:w-32 md:h-11 text-sm md:text-xl flex justify-start my-auto transition-all duration-300 hover:text-[#072a6b]"
            >
              Instagram
            </Link>
          </div>

          <div className="flex justify-start gap-6 group cursor-pointer">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                isDark ? "border-white/40 text-white group-hover:border-white" : "border-[#072a6b]/35 text-[#072a6b] group-hover:border-[#072a6b]"
              }`}
            >
              <FooterBrandIcon name="facebook" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
            </div>
            <Link
              href="https://www.facebook.com/profile.php?id=61554965091065"
              target="_blank"
              className="w-28 h-5 md:w-32 md:h-5 text-sm md:text-xl flex justify-start my-auto transition-all duration-300 hover:text-[#072a6b]"
            >
              Facebook
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="space-y-4">
            <h3 className="text-lg md:text-2xl font-semibold mb-4">
              {messages.footer.workingHoursTitle}
            </h3>
            <p className="text-sm md:text-lg opacity-70">
              {messages.footer.workingHoursValue}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg md:text-2xl font-semibold mb-4">
              {messages.footer.phoneTitle}
            </h3>
            <a href="tel:+380508673048" className="text-sm md:text-lg opacity-70 hover:opacity-100 transition-opacity">
              +380 5086 730 48
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg md:text-2xl font-semibold mb-2">
            {messages.footer.navigationTitle}
          </h3>
          <Link
            href={`/${locale}/#about`}
            className="text-sm md:text-lg transition-all duration-300 hover:translate-x-1 inline-block w-fit hover:text-[#072a6b]"
          >
            {messages.footer.navigationAbout}
          </Link>
          <Link
            href={`/${locale}/#payment-and-delivery`}
            className="text-sm md:text-lg transition-all duration-300 hover:translate-x-1 inline-block w-fit hover:text-[#072a6b]"
          >
            {messages.footer.navigationPaymentAndDelivery}
          </Link>
          <Link
            href={`/${locale}/#reviews`}
            className="text-sm md:text-lg transition-all duration-300 hover:translate-x-1 inline-block w-fit hover:text-[#072a6b]"
          >
            {messages.footer.navigationReviews}
          </Link>
          <Link
            href={`/${locale}/#contacts`}
            className="text-sm md:text-lg transition-all duration-300 hover:translate-x-1 inline-block w-fit hover:text-[#072a6b]"
          >
            {messages.footer.navigationContacts}
          </Link>
        </div>

        <Link
          href={locale === "uk" ? "/uk" : `/${locale}`}
          className={`w-48 h-48 md:w-60 md:h-60 rounded-full flex justify-center transition-all duration-300 hover:scale-105 shadow-lg ${
            isDark
              ? "bg-[#eef7ff] hover:bg-white"
              : "bg-[#072a6b] hover:bg-[#051f52]"
          }`}
        >
          <span
            className={`my-auto text-xl md:text-2xl font-medium tracking-[0.04em] ${
              isDark ? "text-[#072a6b]" : "text-white"
            }`}
          >
            {messages.common.backToHome}
          </span>
        </Link>
      </div>

      {/* On smaller screens (Mobile view) */}
      <div className="lg:hidden flex flex-col gap-10">
        <div className="flex justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex justify-start gap-4 md:gap-6">
              <div className="w-40 h-8 md:w-56 md:h-11 flex flex-col justify-start my-auto">
                <span className="text-lg md:text-2xl">
                  {messages.footer.workingHoursTitle}
                </span>
                <span className="text-sm md:text-lg">
                  {messages.footer.workingHoursValue}
                </span>
              </div>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div className="w-40 h-8 md:w-56 md:h-11 flex flex-col justify-start my-auto">
                <span className="text-lg md:text-2xl">
                  {messages.footer.phoneTitle}
                </span>
                <span className="text-sm md:text-lg">+380 5086 730 48</span>
              </div>
            </div>
          </div>

          <Link
            href={locale === "uk" ? "/uk" : `/${locale}`}
            className={`w-40 h-40 md:w-60 md:h-60 rounded-full flex justify-center transition-all duration-300 hover:scale-105 ${
              isDark
                ? "bg-[#eef7ff] hover:bg-white"
                : "bg-[#072a6b] hover:bg-[#051f52]"
            }`}
          >
            <span
              className={`my-auto text-xl md:text-2xl font-medium tracking-[0.04em] ${
                isDark ? "text-[#072a6b]" : "text-white"
              }`}
            >
              {messages.common.backToHome}
            </span>
          </Link>
        </div>

        <div>
          <span className="text-lg md:text-2xl">
            {messages.footer.navigationTitle}
          </span>
          <div className="flex justify-around gap-4 md:gap-6">
            <Link
              href={`/${locale}/#about`}
              className="text-sm md:text-lg hover:text-[#072a6b]"
            >
              {messages.footer.navigationAbout}
            </Link>
            <Link
              href={`/${locale}/#payment-and-delivery`}
              className="text-sm md:text-lg hover:text-[#072a6b]"
            >
              {messages.footer.navigationPaymentAndDelivery}
            </Link>
            <Link
              href={`/${locale}/#reviews`}
              className="text-sm md:text-lg hover:text-[#072a6b]"
            >
              {messages.footer.navigationReviews}
            </Link>
            <Link
              href={`/${locale}/#contacts`}
              className="text-sm md:text-lg hover:text-[#072a6b]"
            >
              {messages.footer.navigationContacts}
            </Link>
          </div>
        </div>

        <div className="flex justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-start gap-4">
              <div
                className={`w-14 h-14 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white/40 text-white" : "border-[#072a6b]/40 text-[#072a6b]"
                }`}
              >
                <FooterBrandIcon name="location" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
              </div>
              <Link
                href="https://maps.app.goo.gl/jJS3JdddMq6njJvb8?g_st=it"
                target="_blank"
                className="w-48 h-8 md:w-56 md:h-11 text-sm md:text-xl flex justify-start my-3 hover:underline"
              >
                {messages.footer.showroomAddressLabel}
                <br />
                {messages.footer.showroomAddressValue}
              </Link>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div
                className={`w-14 h-14 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white/40 text-white" : "border-[#072a6b]/40 text-[#072a6b]"
                }`}
              >
                <FooterBrandIcon name="email" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
              </div>
              <Link
                href="mailto:Charsukrainianbrand@gmail.com"
                className="w-48 h-5 md:w-56 md:h-5 text-sm md:text-xl flex justify-start my-auto hover:underline"
              >
                Charsukrainianbrand@gmail.com
              </Link>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div
                className={`w-14 h-14 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white/40 text-white" : "border-[#072a6b]/40 text-[#072a6b]"
                }`}
              >
                <FooterBrandIcon name="instagram" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
              </div>
              <Link
                href="https://www.instagram.com/chars.wear/"
                target="_blank"
                className="w-28 h-8 md:w-32 md:h-11 text-sm md:text-xl flex justify-start my-auto hover:underline"
              >
                Instagram
              </Link>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div
                className={`w-14 h-14 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white/40 text-white" : "border-[#072a6b]/40 text-[#072a6b]"
                }`}
              >
                <FooterBrandIcon name="facebook" className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300" />
              </div>
              <Link
                href="https://www.facebook.com/profile.php?id=61554965091065"
                target="_blank"
                className="w-28 h-5 md:w-32 md:h-5 text-sm md:text-xl flex justify-start my-auto hover:underline"
              >
                Facebook
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center mt-16 gap-6 border-t pt-8">
        <div className="flex items-center gap-3 opacity-70">
          <BrandMark size={36} className="h-9 w-auto shrink-0" />
          <span className="text-sm md:text-lg text-center sm:text-left">
            Chars Kyiv © 2025 All rights reserved
          </span>
        </div>
        <div className="flex gap-4 md:gap-6 items-center">
          <Link
            href={`/${locale}/privacy-policy`}
            className="text-sm md:text-lg hover:opacity-100 opacity-60 transition-opacity duration-300 text-center"
          >
            {messages.footer.privacyPolicy}
          </Link>
          <span className="text-sm md:text-lg hidden sm:inline opacity-30">|</span>
          <Link
            href={`/${locale}/terms-of-service`}
            className="text-sm md:text-lg hover:opacity-100 opacity-60 transition-opacity duration-300 text-center"
          >
            {messages.footer.termsOfService}
          </Link>
        </div>
      </div>

      {/* Centered developer credit */}
      <div className="mt-8 mb-6 flex flex-col lg:flex-row items-center gap-3 lg:gap-6 justify-center">
        <Link
          href={
            locale === "uk"
              ? "https://telebots.site/?utm_source=chars_ua_brand"
              : "https://telebots.site/en?utm_source=chars_ua_brand"
          }
          target="_blank"
          className={`px-6 py-3 rounded-full border-2 transition-all duration-300 text-sm md:text-base tracking-wide hover:scale-105 ${
            isDark
              ? "border-white/20 text-white/70 hover:border-white/40 hover:text-white hover:bg-white/5"
              : "border-black/20 text-[#072a6b]/70 hover:border-black/40 hover:text-[#072a6b] hover:bg-black/5"
          }`}
        >
          {messages.footer.devCredit}
        </Link>
        
        {/* Designer credit - same style as dev credit */}
        <Link
          href="https://www.instagram.com/sviat_design?igsh=NzloNjMycWk5b2M3&utm_source=qr"
          target="_blank"
          className={`px-6 py-3 rounded-full border-2 transition-all duration-300 text-sm md:text-base tracking-wide hover:scale-105 ${
            isDark
              ? "border-white/20 text-white/70 hover:border-white/40 hover:text-white hover:bg-white/5"
              : "border-black/20 text-[#072a6b]/70 hover:border-black/40 hover:text-[#072a6b] hover:bg-black/5"
          }`}
        >
          {messages.footer.designCredit}
        </Link>
      </div>
    </footer>
  );
}
