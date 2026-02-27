"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useState, useEffect } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Alert from "@/components/shared/Alert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { buildProductSlug } from "@/lib/slug";

// Add custom styles for smooth transitions
const swiperStyles = `
  .swiper {
    touch-action: pan-y pinch-zoom;
    will-change: transform;
    -webkit-overflow-scrolling: touch;
    overflow: hidden;
  }
  .swiper-wrapper {
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .swiper-slide {
    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .swiper-slide-transition-allow {
    will-change: transform;
  }
  .swiper-slide img,
  .swiper-slide video {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
`;
import { Swiper as SwiperType } from "swiper";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

interface ProductClientProps {
  product: {
    id: number;
    name: string;
    name_en?: string | null;
    name_de?: string | null;
    price: number;
    price_eur?: number | null;
    old_price?: number;
    discount_percentage?: number;
    description?: string;
    description_en?: string | null;
    description_de?: string | null;
    media?: { url: string; type: string }[];
    sizes?: { size: string; stock: string }[];
    colors?: { label: string; hex?: string | null }[];
    fabric_composition?: string;
    fabric_composition_en?: string | null;
    fabric_composition_de?: string | null;
    has_lining?: boolean;
    lining_description?: string;
    lining_description_en?: string | null;
    lining_description_de?: string | null;
    availability_status?: string | null;
  };
}

interface RelatedProduct {
  id: number;
  name: string;
  first_color: { label: string; hex?: string | null } | null;
}

export default function ProductClient({ product: initialProduct }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const quantity = 1;
  const { isDark } = useAppContext();
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const { locale, withLocalePath, messages } = useI18n();
  const { addItem, items, currency } = useBasket();
  const effectiveCurrency =
    currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH");
  const isEuro = effectiveCurrency === "EUR";

  // Inject custom styles for smoother transitions
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = swiperStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []); // swiperStyles is a constant defined outside component

  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const displayName =
    locale === "en"
      ? product.name_en || product.name
      : locale === "de"
      ? product.name_de || product.name
      : product.name;

  const descriptionText =
    locale === "en"
      ? product.description_en || product.description
      : locale === "de"
      ? product.description_de || product.description
      : product.description;

  const fabricText =
    locale === "en"
      ? product.fabric_composition_en || product.fabric_composition
      : locale === "de"
      ? product.fabric_composition_de || product.fabric_composition
      : product.fabric_composition;

  const liningText =
    locale === "en"
      ? product.lining_description_en || product.lining_description
      : locale === "de"
      ? product.lining_description_de || product.lining_description
      : product.lining_description;

  // Auto-select first color if available
  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].label);
    }
  }, [product, selectedColor]);

  // Fetch related products with same name
  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(
          `/api/products/related-colors?name=${encodeURIComponent(product.name)}`
        );
        if (response.ok) {
          const data: RelatedProduct[] = await response.json();
          // Filter out current product
          const filtered = data.filter((p) => p.id !== product.id);
          setRelatedProducts(filtered);
        } else {
          // Silently fail - related products are optional
          console.warn("Could not fetch related products:", response.statusText);
        }
      } catch (error) {
        // Silently fail - related products are optional and shouldn't break the page
        console.warn("Error fetching related products (non-critical):", error);
      }
    }
    
    if (product?.name) {
      fetchRelatedProducts();
    }
  }, [product.name, product.id]);

  // Handle color variant change
  const handleColorVariantChange = async (productId: number) => {
    if (productId === product.id) return;
    
    setIsLoading(true);
    setActiveImageIndex(0);
    
    // Scroll to top on mobile when changing color variant
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const newProduct = await response.json();
        
        // Update URL without reload, preserving locale
        const slug = buildProductSlug(newProduct.name, newProduct.id);
        const newPath = withLocalePath(`/product/${slug}`);
        window.history.pushState(null, "", newPath);
        
        // Update product state with smooth transition
        setTimeout(() => {
          setProduct(newProduct);
          setSelectedSize(null); // Reset size selection
          
          // Auto-select first color if available
          if (newProduct.colors && newProduct.colors.length > 0) {
            setSelectedColor(newProduct.colors[0].label);
          } else {
            setSelectedColor(null);
          }
          
          setIsLoading(false);
        }, 100);
      } else {
        console.error("Failed to fetch product:", response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setAlertMessage(messages.product.selectSizeError);
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setAlertMessage(messages.product.selectColorError);
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!product) {
      setAlertMessage(messages.product.productNotLoadedError);
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!addItem) {
      setAlertMessage(messages.product.basketUnavailableError);
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    // Find stock for selected size
    const selectedSizeData = (product.sizes as { size: string; stock?: number | string }[] | undefined)?.find(
      (s) => s.size === selectedSize
    );
    const availableStock = selectedSizeData ? Number(selectedSizeData.stock ?? 0) : 0;

    // Check if item already exists in basket
    const existingItem = items.find(
      (i) => i.id === product.id && i.size === selectedSize && i.color === selectedColor
    );
    const currentQuantityInBasket = existingItem ? existingItem.quantity : 0;
    const totalRequestedQuantity = currentQuantityInBasket + quantity;

    // Check stock availability
    if (availableStock === 0) {
      setAlertMessage(messages.product.noStockError);
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    if (totalRequestedQuantity > availableStock) {
      const available = availableStock - currentQuantityInBasket;
      if (available <= 0) {
        setAlertMessage(
          messages.product.maxQuantityReachedError(availableStock)
        );
      } else {
        setAlertMessage(
          messages.product.limitedQuantityAvailableError(
            available,
            availableStock
          )
        );
      }
      setAlertType("warning");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    const media = product.media || [];
    const success = addItem(
      {
        id: product.id,
        name: displayName,
        price: product.price,
        price_eur: product.price_eur ?? null,
        currency: effectiveCurrency,
        size: selectedSize,
        quantity,
        imageUrl: getFirstProductImage(media),
        color: selectedColor || undefined,
        discount_percentage: product.discount_percentage,
        stock: availableStock,
      },
      (errorMessage) => {
        // This callback is called if adding fails due to stock
        setAlertMessage(errorMessage);
        setAlertType("warning");
        setTimeout(() => setAlertMessage(null), 4000);
      }
    );

    if (success) {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    }
  };

  const media = product.media || [];
  const sizes = (product.sizes as { size: string; stock?: number | string }[] | undefined)
    ?.filter((s) => Number(s.stock ?? 0) > 0)
    .map((s) => s.size) || [
    "xs",
    "s",
    "m",
    "l",
    "xl",
  ];
  const availabilityStatus =
    (product.availability_status as "available" | "sold_out" | "coming_soon" | null) ||
    "available";
  // Для фронту:
  // - "available" → можна купити
  // - "sold_out" → не можна купити
  // - "coming_soon" → показуємо як "немає в наявності" у статусі, але можна додати в кошик (pre-order)
  const manuallyUnavailable = availabilityStatus === "sold_out";

  const outOfStock = sizes.length === 0;

  // SWIPER
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Update swiper when product changes
  useEffect(() => {
    if (swiper && media.length > 0) {
      setActiveImageIndex(0);
      swiper.slideTo(0);
    }
  }, [product.id, swiper, media.length]);

  // Avoid SSR hydration flicker
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  // Manual next/prev handling (to avoid loop flickers)
  const handleNext = () => {
    if (!swiper) return;
    if (activeImageIndex >= media.length - 1) {
      swiper.slideTo(0);
    } else {
      swiper.slideTo(activeImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!swiper) return;
    if (activeImageIndex === 0) {
      swiper.slideTo(media.length - 1);
    } else {
      swiper.slideTo(activeImageIndex - 1);
    }
  };

  // COLORS

  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
        <div 
          className={`relative w-full lg:w-1/2 flex justify-center transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          style={{ touchAction: 'pan-y pinch-zoom' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          {media && media.length > 0 ? (
            <>
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiper}
            slidesPerView={1}
            spaceBetween={10}
            speed={500}
            allowTouchMove={!isLoading}
            centeredSlides={true}
            onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
            className="product-swiper w-full max-w-[800px]"
            key={product.id}
            touchRatio={1}
            touchAngle={45}
            resistance={true}
            resistanceRatio={0.85}
            followFinger={true}
            threshold={5}
            longSwipes={true}
            longSwipesRatio={0.5}
            longSwipesMs={300}
            watchSlidesProgress={true}
            cssMode={false}
          >
            {media.map((item, i) => (
              <SwiperSlide key={i} style={{ touchAction: 'pan-y pinch-zoom' }}>
                <div 
                  className="flex justify-center items-center max-h-[85vh] overflow-hidden"
                  style={{ 
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  {item.type === "video" ? (
                    <video
                      className="object-contain w-full max-h-[85vh]"
                      src={`/api/images/${item.url}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ 
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        pointerEvents: 'auto'
                      }}
                    />
                  ) : (
                    <Image
                      src={`/api/images/${item.url}`}
                      alt={`Product media ${i}`}
                      width={800}
                      height={1160}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                      priority={i === 0}
                      loading={i <= 1 ? undefined : "lazy"}
                      quality={i === 0 ? 85 : 75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      className="object-contain w-auto h-auto"
                      style={{ 
                        maxHeight: "85vh",
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        pointerEvents: 'auto'
                      }}
                      draggable={false}
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {media.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2 top-[42.5vh] -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black transition-all"
              >
                <svg 
                  className="w-4 h-4 text-gray-700 dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2 top-[42.5vh] -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black transition-all"
              >
                <svg 
                  className="w-4 h-4 text-gray-700 dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
              )}
            </>
          ) : (
            <div className="w-full max-w-[800px] aspect-[2/3] flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-center p-8">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-['Inter']">
                  {messages.product.imagePlaceholder}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-4 md:gap-5 px-4 md:px-0 w-full lg:w-1/2">
          {/* Availability */}
          <div className="text-base md:text-lg font-normal font-['Helvetica'] leading-relaxed tracking-wide">
            {availabilityStatus === "sold_out" || availabilityStatus === "coming_soon"
              ? messages.product.outOfStockLabel
              : messages.product.inStockLabel}
          </div>

          {/* Product Name */}
          <div className={`text-3xl md:text-5xl lg:text-6xl font-normal font-['Inter'] capitalize leading-tight transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {displayName}
          </div>

          {/* Price */}
          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-4 gap-2">
            <div className="flex justify-start gap-8 text-2xl md:text-3xl font-['Helvetica']">
              {(() => {
                const basePrice =
                  isEuro && product.price_eur != null
                    ? product.price_eur
                    : product.price;
                const currencySymbol = isEuro ? "€" : "₴";

                if (product.discount_percentage) {
                  const discounted =
                    basePrice * (1 - product.discount_percentage / 100);
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">
                        {discounted.toFixed(2)}
                        {currencySymbol}
                      </span>
                      <span className="line-through">
                        {basePrice}
                        {currencySymbol}
                      </span>
                      <span className="text-green-600 text-sm">
                        -{product.discount_percentage}%
                      </span>
                    </div>
                  );
                }

                return (
                  <span className="font-medium">
                    {basePrice}
                    {currencySymbol}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Size Picker Title */}
          <div className="flex items-center justify-between">
            <div className="text-base md:text-lg font-['Inter'] uppercase tracking-tight">
              {messages.product.chooseSizeLabel}
            </div>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 underline hover:text-black dark:hover:text-white cursor-pointer transition-all duration-200"
            >
              {messages.product.sizeGuideLabel}
            </button>
          </div>

          {/* Size Options */}
          {sizes.length === 0 || availabilityStatus === "sold_out" ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded border text-sm uppercase tracking-wide bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 w-fit">
              {availabilityStatus === "sold_out"
                ? messages.product.outOfStockLabel
                : messages.product.outOfStockLabel}
            </div>
          ) : (
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
          )}

          {/* Color Picker */}
          {(product.colors && product.colors.length > 0) || relatedProducts.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="text-sm md:text-base font-['Inter'] uppercase tracking-tight">
                {messages.product.colorLabel}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {/* Current product colors */}
                {product.colors && product.colors.length > 0 && 
                  product.colors.map((c, idx) => {
                    const isActive = selectedColor === c.label;
                    const colorDisplayName =
                      messages.catalog.colorNames[c.label] || c.label;
                    return (
                      <button
                        key={`current-${c.label}-${idx}`}
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border transition-all duration-200 ${
                          isActive
                            ? "border-black dark:border-white scale-100"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                        aria-label={messages.product.viewColorAria(colorDisplayName)}
                        title={colorDisplayName}
                        style={{ 
                          backgroundColor: c.hex || "#ffffff",
                        }}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border-2 border-black dark:border-white"></div>
                        )}
                      </button>
                    );
                  })
                }

                {/* Related products colors */}
                {relatedProducts.map((relatedProduct) => {
                  if (!relatedProduct.first_color) return null;
                  
                  const color = relatedProduct.first_color;
                  const relatedColorDisplayName =
                    messages.catalog.colorNames[color.label] || color.label;
                  
                  return (
                    <button
                      key={`related-${relatedProduct.id}`}
                      type="button"
                      onClick={() => handleColorVariantChange(relatedProduct.id)}
                      disabled={isLoading}
                      className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-gray-500 dark:hover:border-gray-400 cursor-pointer ${
                        isLoading ? 'opacity-50 cursor-wait' : ''
                      }`}
                      aria-label={messages.product.viewColorAria(relatedColorDisplayName)}
                      title={relatedColorDisplayName}
                      style={{ 
                        backgroundColor: color.hex || "#ffffff",
                        opacity: 0.7
                      }}
                    />
                  );
                })}
              </div>
              
              {selectedColor && (
                <div className="text-sm font-['Inter'] text-gray-700 dark:text-gray-300 font-light tracking-wide">
                  {messages.catalog.colorNames[selectedColor] || selectedColor}
                </div>
              )}
            </div>
          ) : null}

          {/* Add to Cart Button */}
          <div
            onClick={outOfStock || availabilityStatus === "sold_out" ? undefined : handleAddToCart}
            className={`w-full text-center ${
              isDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-800"
            } p-3 text-lg md:text-xl font-medium font-['Inter'] uppercase tracking-tight transition-all duration-200 ${
              outOfStock || availabilityStatus === "sold_out"
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {availabilityStatus === "sold_out"
              ? messages.product.outOfStockLabel
              : availabilityStatus === "coming_soon"
              ? "pre order"
              : messages.product.addToCartLabel}
          </div>

          {/* Telegram Manager Link */}
          <a
            href="https://t.me/chars_ua"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full text-center border ${
              isDark
                ? "border-gray-500 text-gray-400 hover:border-white hover:text-white"
                : "border-gray-400 text-gray-600 hover:border-black hover:text-black"
            } py-2 px-3 text-sm md:text-base font-light font-['Inter'] cursor-pointer transition-all duration-200`}
          >
            {messages.product.contactManagerLabel}
          </a>

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
                      {messages.product.sizeGuideTitle}
                    </h2>
                    <div className="mt-2 text-sm text-gray-500 font-['Helvetica']">
                      {messages.product.sizeGuideSubtitle}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-black border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            {messages.product.sizeGuideSizeHeader}
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter'] whitespace-pre-line">
                            {messages.product.sizeGuideChestHeader}
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter'] whitespace-pre-line">
                            {messages.product.sizeGuideWaistHeader}
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter'] whitespace-pre-line">
                            {messages.product.sizeGuideHipsHeader}
                          </th>
                          <th className="py-4 px-3 text-center text-xs md:text-sm font-bold uppercase tracking-wider font-['Inter']">
                            {messages.product.sizeGuideHeightHeader}
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
                    <Image
                      src="/images/light-theme/chars-logo-header-light.png"
                      alt="CHARS Logo"
                      width={120}
                      height={40}
                      className="mx-auto h-10 opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification with Link to Cart */}
          {showToast && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-4 z-50 flex items-center gap-3 font-['Inter']">
              <span className="text-sm md:text-base">
                {messages.product.toastAddedToCart}{" "}
                <Link
                  href={withLocalePath("/final")}
                  className="underline hover:no-underline"
                  onClick={() => setShowToast(false)}
                >
                  {messages.product.toastGoToCheckout}
                </Link>
              </span>
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
              {messages.product.descriptionTitle}
            </div>
            <div className="text-sm md:text-lg font-['Inter'] leading-relaxed tracking-wide">
              {descriptionText}
            </div>
          </div>

          {fabricText && (
            <div className="opacity-90">
              <h3>{messages.product.fabricTitle} </h3>
              <span>{fabricText}</span>
            </div>
          )}

          {product.has_lining && liningText && (
            <div className="opacity-90">
              <h3>{messages.product.liningTitle} </h3>
              <span>{liningText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
