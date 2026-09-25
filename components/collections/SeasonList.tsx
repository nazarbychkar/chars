"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  SEASON_VALUES,
  getSeasonLabel,
  seasonCatalogHref,
} from "@/lib/seasons";

type SeasonListProps = {
  variant?: "page" | "menu" | "header";
  onItemClick?: () => void;
  isDark?: boolean;
};

export default function SeasonList({
  variant = "page",
  onItemClick,
  isDark = false,
}: SeasonListProps) {
  const { messages, withLocalePath } = useI18n();
  const labels = messages.header;

  const listClass =
    variant === "page"
      ? "flex flex-col gap-5 sm:gap-6 w-full max-w-md"
      : variant === "header"
        ? "flex flex-col gap-3 min-w-[180px]"
        : "flex flex-col pl-6 mt-2 mb-3 space-y-2 text-lg sm:text-xl";

  return (
    <ul className={listClass} role="list">
      {SEASON_VALUES.map((value) => {
        const label = getSeasonLabel(value, labels);
        const linkClass =
          variant === "page"
            ? "block font-sans text-xl sm:text-2xl uppercase tracking-[0.14em] leading-snug transition-opacity hover:opacity-60"
            : variant === "header"
              ? `block text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isDark
                    ? "text-stone-200 hover:text-white"
                    : "text-stone-700 hover:text-[#072a6b]"
                }`
              : "block uppercase tracking-[0.12em] hover:opacity-70 dark:hover:text-white";

        return (
          <li key={value}>
            <Link
              href={withLocalePath(seasonCatalogHref(value))}
              onClick={onItemClick}
              className={linkClass}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
