"use client"

import { createContext, useContext, useEffect, useState } from "react";

interface ContextType {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  isSiderbarOpen: boolean;
  setIsSiderbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<ContextType>({
  isDark: false,
  setIsDark: () => {},
  isSiderbarOpen: false,
  setIsSiderbarOpen: () => {}
});

import { ReactNode } from "react";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [isSiderbarOpen, setIsSiderbarOpen] = useState(false);

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    // Update body class and save to localStorage
    if (isDark) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <AppContext.Provider value={{ isDark, setIsDark, isSiderbarOpen, setIsSiderbarOpen }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easier access
export const useAppContext = () => useContext(AppContext);
