"use client";

import React from "react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info"; // Type kept for API compatibility but not used
  message: string;
  onClose?: () => void;
  isVisible: boolean;
}

export default function Alert({ message, onClose, isVisible }: AlertProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-4 z-50 flex items-center gap-3 font-['Inter']">
      <span className="text-sm md:text-base">
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Закрити"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
