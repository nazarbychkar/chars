"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  lines,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  if (variant === "text" && lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-4 rounded ${
              i === lines - 1 ? "w-3/4" : "w-full"
            } ${className}`}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`${baseClasses} rounded-lg ${className}`}
        style={{ width: width || "100%", height: height || "600px" }}
      >
        <div className="p-4 space-y-3">
          <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const shapeClasses =
    variant === "circular" ? "rounded-full" : "rounded";
  
  return (
    <div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
      aria-label="Завантаження..."
      role="status"
    >
      <span className="sr-only">Завантаження...</span>
    </div>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    </div>
  );
}

// Product Page Skeleton
export function ProductPageSkeleton() {
  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
        {/* Image Section */}
        <div className="w-full lg:w-1/2">
          <Skeleton variant="rectangular" height="85vh" className="rounded-lg" />
        </div>
        
        {/* Info Section */}
        <div className="w-full lg:w-1/2 space-y-6">
          <Skeleton variant="text" lines={2} />
          <Skeleton variant="rectangular" height="60px" />
          <Skeleton variant="text" lines={3} />
          <Skeleton variant="rectangular" height="50px" width="200px" />
        </div>
      </div>
    </section>
  );
}

// Catalog Grid Skeleton
export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
