"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference on initial load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prevState) => {
      const newTheme = !prevState ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return !prevState;
    });
  };

  useEffect(() => {
    // Toggle the class on the body element based on the theme state
    if (isDark) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [isDark]);

  return (
    <button className="cursor-pointer" onClick={}>
      <Image
        height="32"
        width="32"
        alt="theme switch"
        src="/theme-switch.png"
      />
    </button>
  );
}
