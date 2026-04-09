export {};

declare global {
  interface Window {
    fbq?: (
      method: string,
      eventName?: string,
      params?: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => void;
    clarity?: (...args: unknown[]) => void;
  }
}


