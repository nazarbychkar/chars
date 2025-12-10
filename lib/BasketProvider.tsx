"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface BasketItem {
  id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
  color?: string;
  discount_percentage?: number;
  stock?: number; // Available stock for this size
}

interface BasketContextType {
  items: BasketItem[];
  addItem: (item: BasketItem, onError?: (message: string) => void) => boolean;
  removeItem: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number, onError?: (message: string) => void) => boolean;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "basketItems";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  // Load from localStorage only on client side after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Handle localStorage read errors
    }
  }, []);

  // Save basket items to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Handle localStorage write errors if needed
    }
  }, [items]);

  function addItem(newItem: BasketItem, onError?: (message: string) => void): boolean {
    const trackAddToCart = () => {
      if (typeof window !== "undefined" && window.fbq) {
        const value = (newItem.discount_percentage
          ? newItem.price * (1 - newItem.discount_percentage / 100)
          : newItem.price) * newItem.quantity;
        window.fbq("track", "AddToCart", {
          content_name: newItem.name,
          content_ids: [String(newItem.id)],
          content_type: "product",
          value,
          currency: "UAH",
        });
      }
    };

    let shouldAdd = true;
    let errorMessage = "";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) =>
          i.id === newItem.id &&
          i.size === newItem.size &&
          i.color === newItem.color
      );
      
      if (existingIndex !== -1) {
        const existingItem = prevItems[existingIndex];
        const newQuantity = existingItem.quantity + newItem.quantity;
        
        // Check stock availability
        if (existingItem.stock !== undefined && newQuantity > existingItem.stock) {
          const available = existingItem.stock - existingItem.quantity;
          errorMessage = available <= 0
            ? `На жаль, ви вже додали максимум доступної кількості цього товару. В наявності: ${existingItem.stock} шт.`
            : `На жаль, доступно лише ще ${available} шт. цього товару. В наявності: ${existingItem.stock} шт.`;
          shouldAdd = false;
          return prevItems;
        }
        
        const updated = [...prevItems];
        updated[existingIndex].quantity = newQuantity;
        trackAddToCart();
        return updated;
      }
      
      // Check stock for new item
      if (newItem.stock !== undefined && newItem.quantity > newItem.stock) {
        errorMessage = `На жаль, доступно лише ${newItem.stock} шт. цього товару.`;
        shouldAdd = false;
        return prevItems;
      }
      
      trackAddToCart();
      return [...prevItems, newItem];
    });

    // Call error callback if needed (after setState, but immediately)
    if (!shouldAdd && onError && errorMessage) {
      // Use setTimeout to ensure state update is processed first
      setTimeout(() => onError(errorMessage), 0);
    }
    
    return shouldAdd;
  }

  function removeItem(id: number, size: string) {
    setItems((prev) =>
      prev.filter((item) => item.id !== id || item.size !== size)
    );
  }

  function updateQuantity(id: number, size: string, quantity: number, onError?: (message: string) => void): boolean {
    let shouldUpdate = true;
    let errorMessage = "";

    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === id && item.size === size) {
          // Check stock availability
          if (item.stock !== undefined && quantity > item.stock) {
            errorMessage = `Максимальна кількість в наявності: ${item.stock} шт.`;
            shouldUpdate = false;
            return item;
          }
          return { ...item, quantity: Math.max(quantity, 1) };
        }
        return item;
      });
    });

    // Call error callback if needed (after setState, but immediately)
    if (!shouldUpdate && onError && errorMessage) {
      // Use setTimeout to ensure state update is processed first
      setTimeout(() => onError(errorMessage), 0);
    }
    
    return shouldUpdate;
  }

  function clearBasket() {
    setItems([]);
  }

  return (
    <BasketContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearBasket }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
