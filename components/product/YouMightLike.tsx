"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/lib/GeneralProvider";

interface Product {
  id: number;
  name: string;
  price: number;
  media: { url: string; type: string }[];
}

export default function YouMightLike() {
  const { isDark } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const allProducts: Product[] = await res.json();

        // Shuffle and pick 4
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        setProducts(selected);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return null; // or a spinner

  return (
    <section className="max-w-[1920px] w-full mx-auto px-4 md:px-0">
      <div className="flex flex-col gap-10">
        {/* Title */}
        <div
          className={`mx-0 md:mx-10 text-4xl md:text-7xl font-normal font-['Inter'] leading-tight md:leading-[84.91px] text-center md:text-left`}
        >
          Вам може сподобатися
        </div>

        {/* Products list */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-around gap-8">
          {products.map((product) => {
            const firstPhoto = product.media.find((m) => m.type === "photo");
            const imageUrl = firstPhoto?.url || product.media?.[0]?.url;
            const image = imageUrl
              ? `/api/images/${imageUrl}`
              : "https://placehold.co/432x613";
            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="w-full sm:w-96 relative mx-auto"
              >
                <img
                  className="w-full h-auto sm:h-[613px] object-cover"
                  src={image}
                  alt={product.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://placehold.co/400x600/cccccc/666666?text=No+Image";
                  }}
                />
                <div className="mt-2 text-lg sm:text-xl font-normal font-['Inter'] capitalize leading-normal text-center">
                  {product.name}
                </div>
                <div className="mt-1 w-24 h-4 mx-auto text-lg sm:text-xl font-normal font-['Inter'] leading-none text-center">
                  {product.price} ₴
                </div>
              </Link>
            );
          })}
        </div>

        {/* More products button container */}
        <div className="w-full max-w-full sm:max-w-[1824px] h-[300px] sm:h-[679px] bg-gray-300 relative overflow-hidden mx-auto">
          <Link
            href="/catalog"
            className="absolute bg-white inline-flex justify-center items-center gap-2 px-4 py-2 rounded-md left-1/2 transform -translate-x-1/2 bottom-30 w-max sm:w-80 h-auto sm:h-16"
          >
            <div className="text-center justify-center text-black text-base sm:text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              більше товарів
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
