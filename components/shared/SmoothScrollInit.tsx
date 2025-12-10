"use client";

import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/smoothScroll";

export default function SmoothScrollInit() {
  useEffect(() => {
    initSmoothScroll();
  }, []);

  return null;
}
