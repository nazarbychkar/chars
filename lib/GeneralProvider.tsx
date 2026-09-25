"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ContextType {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBasketOpen: boolean;
  setIsBasketOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSeasonOpen: boolean;
  setIsSeasonOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<ContextType>({
  isDark: false,
  setIsDark: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  isBasketOpen: false,
  setIsBasketOpen: () => {},
  isSeasonOpen: false,
  setIsSeasonOpen: () => {},
  isSearchOpen: false,
  setIsSearchOpen: () => {},
});

import { ReactNode } from "react";
import { applySiteTheme, readStoredTheme } from "@/lib/siteTheme";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => readStoredTheme() === "dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    applySiteTheme(isDark ? "dark" : "light");
  }, [isDark]);

  const isOverlayOpen =
    isSidebarOpen || isBasketOpen || isSearchOpen || isSeasonOpen;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (!isOverlayOpen) {
      if (body.dataset.appOverlayLock === "1") {
        body.style.overflow = body.dataset.appOverlayPrevOverflow || "";
        body.style.paddingRight = body.dataset.appOverlayPrevPadding || "";
        delete body.dataset.appOverlayLock;
        delete body.dataset.appOverlayPrevOverflow;
        delete body.dataset.appOverlayPrevPadding;
      }
      return;
    }

    if (body.dataset.appOverlayLock !== "1") {
      body.dataset.appOverlayPrevOverflow = body.style.overflow;
      body.dataset.appOverlayPrevPadding = body.style.paddingRight;
      body.dataset.appOverlayLock = "1";
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      if (body.dataset.appOverlayLock === "1") {
        body.style.overflow = body.dataset.appOverlayPrevOverflow || "";
        body.style.paddingRight = body.dataset.appOverlayPrevPadding || "";
        delete body.dataset.appOverlayLock;
        delete body.dataset.appOverlayPrevOverflow;
        delete body.dataset.appOverlayPrevPadding;
      }
    };
  }, [isOverlayOpen]);

  return (
    <AppContext.Provider
      value={{
        isDark,
        setIsDark,
        isSidebarOpen,
        setIsSidebarOpen,
        isBasketOpen,
        setIsBasketOpen,
        isSeasonOpen,
        setIsSeasonOpen,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easier access
export const useAppContext = () => useContext(AppContext);
