"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useBasket } from "@/lib/BasketProvider";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

interface Product {
  id: number;
  name: string;
  price: number;
  media: { url: string; type: string }[];
  description: string;
  sizes?: { size: string; stock: string }[];
}

export default function Product() {
  const { addItem } = useBasket();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { isDark } = useAppContext();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Оберіть розмір");
      return;
    }
    if (!product) {
      alert("Product not loaded");
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      imageUrl: images[0]?.url || "",
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        // console.log(data);
        setProduct(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10">Loading product...</div>;
  if (error || !product)
    return <div className="p-10">Error: {error || "Product not found"}</div>;

  const images = product.media.filter((m) => m.type === "photo");
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
        {/* Image Section */}
        <div className="relative flex justify-center w-full lg:w-1/2">
          <img
            className="w-full max-w-[800px] max-h-[1160px] object-cover"
            src={
              `/api/images/${images[activeImageIndex]?.url}` || "https://placehold.co/800x1160"
            }
            alt={product.name}
          />

          {images.length > 1 && (
            <>
              {/* Prev */}
              <button
                className="text-4xl md:text-6xl absolute top-1/64 left-1/16 rounded-full shadow-md cursor-pointer"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
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
                />
              </button>

              {/* Next */}
              <button
                className="text-4xl md:text-6xl absolute top-1/64 right-1/16 rounded-full shadow-md cursor-pointer"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
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
                />
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-6 md:gap-10 px-4 md:px-0 w-full lg:w-1/2">
          {/* Availability */}
          <div className="text-lg md:text-xl font-normal font-['Helvetica'] leading-relaxed tracking-wide">
            В наявності
          </div>

          {/* Product Name */}
          <div className="text-4xl md:text-6xl lg:text-7xl font-normal font-['Inter'] capitalize leading-tight">
            {product.name}
          </div>

          {/* Price */}
          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-5 gap-2">
            <div className="text-red-500 text-xl md:text-2xl font-['Helvetica']">
              {product.price} ₴
            </div>
          </div>

          {/* Size Picker Title */}
          <div className="text-lg md:text-2xl font-['Inter'] uppercase tracking-tight">
            Оберіть розмір
          </div>

          {/* Size Options */}
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <div
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-16 sm:w-20 md:w-24 p-2 sm:p-4 border flex justify-center text-lg md:text-xl font-['Inter'] uppercase cursor-pointer ${
                  selectedSize === size
                    ? "border-black font-bold"
                    : "border-gray-300"
                }`}
              >
                {SIZE_MAP[size] || size}
              </div>
            ))}
          </div>

          {/* Add to Cart Button */}
          <div
            onClick={handleAddToCart}
            className={`w-full sm:w-auto text-center ${
              isDark ? "bg-white text-black" : "bg-black text-white"
            } p-3 text-xl md:text-2xl font-medium font-['Inter'] uppercase tracking-tight cursor-pointer`}
          >
            в кошик
          </div>

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-5 py-3 rounded shadow-lg z-50">
              Товар додано до кошика!
            </div>
          )}

          {/* Description Section */}
          <div className="w-full md:w-[522px]">
            <div className="mb-3 md:mb-5 text-2xl md:text-3xl font-['Inter'] uppercase tracking-tight">
              опис
            </div>
            <div className="text-base md:text-2xl font-['Inter'] leading-relaxed tracking-wide">
              {product.description}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
