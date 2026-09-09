"use client";

import { useEffect } from "react";

/**
 * Locks document body scroll while `locked` is true.
 * Safe for nested locks (ref-count via data attribute).
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const depth = Number(body.dataset.scrollLockDepth || "0") + 1;
    body.dataset.scrollLockDepth = String(depth);

    if (depth === 1) {
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      const next = Math.max(
        0,
        Number(body.dataset.scrollLockDepth || "1") - 1
      );
      if (next === 0) {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPaddingRight;
        delete body.dataset.scrollLockDepth;
      } else {
        body.dataset.scrollLockDepth = String(next);
      }
    };
  }, [locked]);
}
