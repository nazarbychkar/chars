"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useColorDisplayName } from "@/lib/useAutoLocalizedText";

type ColorSwatchProps = {
  label: string;
  hex?: string | null;
  isActive: boolean;
  onSelect: () => void;
  disabled?: boolean;
  variant?: "current" | "related";
};

export default function ColorSwatch({
  label,
  hex,
  isActive,
  onSelect,
  disabled,
  variant = "current",
}: ColorSwatchProps) {
  const { locale, messages } = useI18n();
  const colorDisplayName = useColorDisplayName(
    label,
    locale,
    messages.catalog.colorNames
  );

  const isRelated = variant === "related";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border transition-all duration-200 ${
        isRelated
          ? `border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400 cursor-pointer ${
              disabled ? "opacity-50 cursor-wait" : ""
            }`
          : isActive
            ? "border-black dark:border-white scale-100"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
      }`}
      aria-label={messages.product.viewColorAria(colorDisplayName)}
      title={colorDisplayName}
      style={{
        backgroundColor: hex || "#ffffff",
        opacity: isRelated ? 0.7 : 1,
      }}
    >
      {isActive && !isRelated && (
        <div className="absolute inset-0 rounded-full border-2 border-black dark:border-white" />
      )}
    </button>
  );
}
