"use client";

import { useEffect, useRef } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions) {
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const pullDistance = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;

      touchCurrentY.current = e.touches[0].clientY;
      pullDistance.current = touchCurrentY.current - touchStartY.current;

      if (pullDistance.current > 0 && window.scrollY === 0) {
        e.preventDefault();
        const distance = Math.min(pullDistance.current, threshold * 2);
        
        // Visual feedback could be added here
        // For example, showing a loading indicator
        if (distance >= threshold) {
          document.body.style.transform = `translateY(${threshold}px)`;
        } else {
          document.body.style.transform = `translateY(${distance}px)`;
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;
      document.body.style.transform = "";

      if (pullDistance.current >= threshold) {
        await onRefresh();
      }

      pullDistance.current = 0;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      document.body.style.transform = "";
    };
  }, [onRefresh, threshold, enabled]);
}
