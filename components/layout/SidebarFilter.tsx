"use client";

import { useEffect } from "react";

interface SidebarFilterProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAccordion: number | null;
  setOpenAccordion: React.Dispatch<React.SetStateAction<number | null>>;
  isDark: boolean;
  sortOrder: "asc" | "desc";
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  minPrice: number | null;
  maxPrice: number | null;
  setMinPrice: React.Dispatch<React.SetStateAction<number | null>>;
  setMaxPrice: React.Dispatch<React.SetStateAction<number | null>>;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  colors: string[];
}

export default function SidebarFilter({
  isOpen,
  setIsOpen,
  openAccordion,
  setOpenAccordion,
  isDark,
  sortOrder,
  setSortOrder,
  selectedSizes,
  setSelectedSizes,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  selectedColors,
  setSelectedColors,
  colors,
}: SidebarFilterProps) {
  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const availableSizes = ["XS", "S", "M", "L", "XL"];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  useEffect(() => {
    console.log("Selected colors updated:", selectedColors);
  }, [selectedColors]);

  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl sm:text-2xl uppercase font-semibold">
              Фільтрувати / Сортувати
            </div>
            <button
              className="text-2xl sm:text-3xl hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Accordion: Sorting */}
          <div className="w-full border-b px-2 sm:px-4 py-3 hover:bg-gray-200 transition">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(1)}
            >
              <span className="text-xl sm:text-2xl uppercase">
                Сортувати за
              </span>
              <span className="font-semibold text-xl sm:text-2xl">
                {openAccordion === 1 ? "−" : "+"}
              </span>
            </div>

            {openAccordion === 1 && (
              <div className="pl-4 mt-2 space-y-2">
                <button
                  className={`block text-left w-full hover:text-[#8C7461] text-base sm:text-lg ${
                    sortOrder === "asc" ? "font-semibold text-[#8C7461]" : ""
                  }`}
                  onClick={() => setSortOrder("asc")}
                >
                  За зростанням ціни
                </button>
                <button
                  className={`block text-left w-full hover:text-[#8C7461] text-base sm:text-lg ${
                    sortOrder === "desc" ? "font-semibold text-[#8C7461]" : ""
                  }`}
                  onClick={() => setSortOrder("desc")}
                >
                  За спаданням ціни
                </button>
              </div>
            )}
          </div>

          {/* Accordion: Size */}
          <div className="w-full border-b px-2 sm:px-4 py-3 hover:bg-gray-200 transition">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(2)}
            >
              <span className="text-xl sm:text-2xl uppercase">Розмір</span>
              <span className="font-semibold text-xl sm:text-2xl">
                {openAccordion === 2 ? "−" : "+"}
              </span>
            </div>

            {openAccordion === 2 && (
              <div className="pl-4 mt-2 space-y-2">
                {availableSizes.map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="form-checkbox h-4 w-4 text-[#8C7461]"
                    />
                    <span className="text-base sm:text-lg">{size}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Accordion: Color */}
          <div className="w-full border-b px-2 sm:px-4 py-3 hover:bg-gray-200 transition">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(3)}
            >
              <span className="text-xl sm:text-2xl uppercase">Колір</span>
              <span className="font-semibold text-xl sm:text-2xl">
                {openAccordion === 3 ? "−" : "+"}
              </span>
            </div>

            {openAccordion === 3 && (
              <div className="pl-4 mt-2 space-y-2">
                {colors.map((color, index) => (
                  <label
                    key={index} // Use the color string as the key
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={() => toggleColor(color)}
                      className="form-checkbox h-4 w-4 text-[#8C7461]"
                    />
                    <span className="text-base sm:text-lg">{color}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Accordion: Price */}
          <div className="w-full border-b px-2 sm:px-4 py-3 hover:bg-gray-200 transition">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(4)}
            >
              <span className="text-xl sm:text-2xl uppercase">Вартість</span>
              <span className="font-semibold text-xl sm:text-2xl">
                {openAccordion === 4 ? "−" : "+"}
              </span>
            </div>

            {openAccordion === 4 && (
              <div className="pl-4 mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Мінімальна ціна
                  </label>
                  <input
                    type="number"
                    value={minPrice ?? ""}
                    onChange={(e) =>
                      setMinPrice(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="від"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Максимальна ціна
                  </label>
                  <input
                    type="number"
                    value={maxPrice ?? ""}
                    onChange={(e) =>
                      setMaxPrice(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="до"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
