"use client";

import React from "react";
import Link from "next/link";
import { useAppContext } from "@/lib/GeneralProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Reviews() {
  const { isDark } = useAppContext();
  const { messages } = useI18n();

  return (
    <section
      id="reviews"
      className={`scroll-mt-5 max-w-[1920px] w-full mx-auto relative ${
        isDark ? "bg-stone-900" : "bg-[#e3dfd7]"
      } px-6 py-12 md:py-20`}
    >
      {/* Content section */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
        <div className="text-4xl lg:text-7xl font-medium font-['Montserrat'] lg:leading-[74.69px]">
          {messages.home.reviewsTitleLine1}
          <br />
          {messages.home.reviewsTitleLine2}
        </div>

        <div className="text-base lg:text-2xl font-normal font-['Arial'] leading-relaxed">
          {messages.home.reviewsSubtitle.split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              <br />
            </span>
          ))}
          <Link
            href="https://www.instagram.com/chars.wear/"
            className="underline italic hover:text-blue-600 transition-colors"
          >
            Instagram
          </Link>
        </div>
      </div>
    </section>
  );
}
