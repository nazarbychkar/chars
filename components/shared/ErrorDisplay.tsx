"use client";

import React from "react";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  showRetry?: boolean;
}

export default function ErrorDisplay({
  error,
  onRetry,
  title = "Щось пішло не так",
  showRetry = true,
}: ErrorDisplayProps) {
  return (
    <div 
      className="text-center py-20 px-4"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="mb-4">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold mb-2 dark:text-white">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
      {showRetry && (
        <div className="flex gap-4 justify-center flex-wrap">
          {onRetry ? (
            <button
              onClick={onRetry}
              className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Спробувати ще раз"
            >
              Спробувати ще раз
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Оновити сторінку"
            >
              Оновити сторінку
            </button>
          )}
          <a
            href="/catalog"
            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Перейти до каталогу"
          >
            До каталогу
          </a>
        </div>
      )}
    </div>
  );
}
