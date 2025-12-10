"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    triggerOnce = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }

        if (isVisible && triggerOnce && hasIntersected) {
          observer.unobserve(target);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [threshold, root, rootMargin, triggerOnce, hasIntersected]);

  return { targetRef, isIntersecting, hasIntersected };
}

// Hook for lazy loading images
export function useLazyImage(src: string) {
  const { targetRef, hasIntersected } = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.01,
  });

  return {
    imgRef: targetRef,
    shouldLoad: hasIntersected,
    src: hasIntersected ? src : undefined,
  };
}
