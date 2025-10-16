"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Alert from "@/components/shared/Alert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { useProduct } from "@/lib/useProducts";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

export default function Product() {
  const { addItem } = useBasket();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const quantity = 1;
  const { isDark } = useAppContext();
  const { id } = useParams();
  
  // Use the optimized hook for product fetching
  const { product, loading, error } = useProduct(id as string);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Auto-select first color if available
  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].label);
    }
  }, [product, selectedColor]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setAlertMessage("Оберіть розмір");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setAlertMessage("Оберіть колір");
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!product) {
      setAlertMessage("Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    const media = product.media || [];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      imageUrl: getFirstProductImage(media),
      color: selectedColor || undefined,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return <div className="p-10">Loading product...</div>;
  if (error || !product)
    return <div className="p-10">Error: {error || "Product not found"}</div>;

  const media = product.media || [];
  const sizes = product.sizes?.map((s) => s.size) || [
    "xs",
    "s",
    "m",
    "l",
    "xl",
  ];

  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
        {/* Media Section */}
        <div className="relative flex justify-center w-full lg:w-1/2">
          <div className="w-full max-w-[800px] max-h-[85vh] flex items-center justify-center overflow-hidden">
            {media[activeImageIndex]?.type === "video" ? (
              <video
                className="w-full h-auto max-h-[85vh] object-contain"
                src={`/api/images/${media[activeImageIndex]?.url}`}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                className="w-full h-auto max-h-[85vh] object-contain"
                src={
                  `/api/images/${media[activeImageIndex]?.url}` ||
                  "https://placehold.co/800x1160"
                }
                alt={product.name}
              />
            )}
          </div>

          {media.length > 1 && (
            <>
              {/* Prev */}
              <button
                className="absolute top-[40%] -translate-y-1/2 left-2 md:left-4 rounded-full cursor-pointer z-10 opacity-60 hover:opacity-100 transition"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === 0 ? media.length - 1 : prev - 1
                  )
                }
              >
                <img
                  src={`${
                    isDark
                      ? "/images/dark-theme/slider-button-left.svg"
                      : "/images/light-theme/slider-button-left.svg"
                  }`}
                  alt="Previous"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </button>

              {/* Next */}
              <button
                className="absolute top-[40%] -translate-y-1/2 right-2 md:right-4 rounded-full cursor-pointer z-10 opacity-60 hover:opacity-100 transition"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === media.length - 1 ? 0 : prev + 1
                  )
                }
              >
                <img
                  src={`${
                    isDark
                      ? "/images/dark-theme/slider-button-right.svg"
                      : "/images/light-theme/slider-button-right.svg"
                  }`}
                  alt="Next"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-6 md:gap-10 px-4 md:px-0 w-full lg:w-1/2">
          {/* Availability */}
          <div className="text-base md:text-lg font-normal font-['Helvetica'] leading-relaxed tracking-wide">
            В наявності
          </div>

          {/* Product Name */}
          <div className="text-3xl md:text-5xl lg:text-6xl font-normal font-['Inter'] capitalize leading-tight">
            {product.name}
          </div>

          {/* Price */}
          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-4 gap-2">
            <div className="text-red-500 text-lg md:text-xl font-['Helvetica']">
              {product.price} ₴
            </div>
          </div>

          {/* Size Picker Title */}
          <div className="text-base md:text-lg font-['Inter'] uppercase tracking-tight">
            Оберіть розмір
          </div>

          {/* Size Options */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {sizes.map((size) => (
              <div
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-19 sm:w-19 md:w-22 p-2 sm:p-3 border-2 flex justify-center text-base md:text-lg font-['Inter'] uppercase cursor-pointer transition-all duration-200 ${
                  selectedSize === size
                    ? "border-black dark:border-white font-bold scale-105 shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 hover:scale-105 hover:shadow-md"
                }`}
              >
                {SIZE_MAP[size] || size}
              </div>
            ))}
          </div>

          {/* Color Picker */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sm md:text-base font-['Inter'] uppercase tracking-tight">
                  Колір
                </div>
              </div>
              <div className="flex items-end gap-4">
                {product.colors.map((c, idx) => {
                  const isActive = selectedColor === c.label;
                  return (
                    <div
                      key={`${c.label}-${idx}`}
                      className="flex flex-col items-center"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        className={`relative flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border transition ${
                          isActive
                            ? "border-gray-700"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                        aria-label={c.label}
                        title={c.label}
                        style={{ backgroundColor: c.hex || "#ffffff" }}
                      />
                      <div
                        className={`mt-1 h-[2px] rounded-full ${
                          isActive ? "w-6 bg-black" : "w-0 bg-transparent"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              {selectedColor && (
                <div className="text-base md:text-lg font-['Inter'] text-gray-700">
                  Колір: {selectedColor}
                </div>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <div
            onClick={handleAddToCart}
            className={`w-full text-center ${
              isDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-800"
            } p-3 text-lg md:text-xl font-medium font-['Inter'] uppercase tracking-tight cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
          >
            в кошик
          </div>

          {/* Size Guide Link */}
          <div className="text-right">
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 underline hover:text-black dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-105"
            >
              Розмірна сітка
            </button>
          </div>

          {/* Size Guide Modal */}
          {showSizeGuide && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSizeGuide(false)}
            >
              <div
                className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-6 right-6 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-light hover:bg-gray-800 transition-colors z-10"
                >
                  ×
                </button>

                <div className="p-8 md:p-12">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight font-['Inter']">
                      РОЗМІРНА СІТКА
                    </h2>
                    <div className="mt-2 text-sm text-gray-500 font-['Helvetica']">
                      Всі вимірювання вказані в сантиметрах
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-black border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Розмір
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Обхват
                            <br />
                            грудей
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Обхват
                            <br />
                            талії
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Обхват
                            <br />
                            бедер
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            Зріст
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            S
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">88-92</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">77-80</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">93-96</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">175-180</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            M
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">96-100</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">84-88</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">98-101</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">180-185</div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            L
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">104-108</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">92-97</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">103-106</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">180-190</div>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-5 px-3 text-center font-bold text-lg font-['Inter']">
                            XL
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">112-116</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">100-104</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">108-111</div>
                          </td>
                          <td className="py-5 px-3 text-center font-['Helvetica']">
                            <div className="text-base">190+</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center mt-10 pt-6 border-t border-gray-200">
                    <img
                      src="/images/light-theme/chars-logo-header-light.png"
                      alt="CHARS Logo"
                      className="mx-auto h-10 opacity-80"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const nextElement = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = "block";
                        }
                      }}
                    />
                    <div className="text-2xl font-bold hidden font-['Inter']">
                      CHARS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-5 py-3 rounded shadow-lg z-50">
              Товар додано до кошика!
            </div>
          )}

          {/* Alert */}
          <Alert
            type={alertType}
            message={alertMessage || ""}
            isVisible={!!alertMessage}
            onClose={() => setAlertMessage(null)}
          />

          {/* Description Section */}
          <div className="w-full md:w-[522px]">
            <div className="mb-3 md:mb-4 text-xl md:text-2xl font-['Inter'] uppercase tracking-tight">
              опис
            </div>
            <div className="text-sm md:text-lg font-['Inter'] leading-relaxed tracking-wide">
              {product.description}
            </div>
          </div>

          {product.fabric_composition && (
            <div className="opacity-90">
              <h3>Cклад тканини: </h3>
              <span>{product.fabric_composition}</span>
            </div>
          )}

          {product.has_lining && (
            <div className="opacity-90">
              <h3>Підкладка: </h3>
              <span>{product.lining_description}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
