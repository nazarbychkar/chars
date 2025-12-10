"use client";

import React, { useState, useEffect } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  validation?: (value: string) => string | null;
  className?: string;
  inputClassName?: string;
}

export default function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  validation,
  className = "",
  inputClassName = "",
}: FormFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (touched && validation) {
      const validationError = validation(value);
      setError(validationError);
      setIsValid(validationError === null && value.length > 0);
    }
  }, [value, touched, validation]);

  const handleBlur = () => {
    setTouched(true);
    if (validation) {
      const validationError = validation(value);
      setError(validationError);
      setIsValid(validationError === null && value.length > 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e);
    if (touched && validation) {
      const validationError = validation(e.target.value);
      setError(validationError);
      setIsValid(validationError === null && e.target.value.length > 0);
    }
  };

  const InputComponent = type === "textarea" ? "textarea" : "input";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={id}
        className="text-xl sm:text-2xl font-normal font-['Arial']"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <InputComponent
          type={type !== "textarea" ? type : undefined}
          id={id}
          placeholder={placeholder}
          className={`border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded w-full transition-all ${
            error && touched
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : isValid && touched
              ? "border-green-500 focus:ring-green-500 focus:border-green-500"
              : "focus:ring-black focus:border-black"
          } ${inputClassName}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error && touched ? "true" : "false"}
          aria-describedby={error && touched ? `${id}-error` : undefined}
        />
        {isValid && touched && (
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      {error && touched && (
        <p
          id={`${id}-error`}
          className="text-red-500 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Validation helpers
export const validators = {
  required: (value: string) => {
    if (!value.trim()) {
      return "Це поле обов'язкове";
    }
    return null;
  },
  
  fullName: (value: string) => {
    const trimmed = value.trim();
    const nameParts = trimmed.split(/\s+/);
    if (nameParts.length < 2) {
      return "Будь ласка, введіть ваше повне ім'я та прізвище";
    }
    if (trimmed.length < 3) {
      return "Ім'я занадто коротке";
    }
    return null;
  },
  
  phone: (value: string) => {
    const phoneRegex = /^[\+]?[0-9]{10,13}$/;
    const cleaned = value.replace(/[\s\-\(\)]/g, "");
    if (!phoneRegex.test(cleaned)) {
      return "Введіть коректний номер телефону (10-13 цифр)";
    }
    return null;
  },
  
  email: (value: string) => {
    if (!value) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Введіть коректну email адресу";
    }
    return null;
  },
};
