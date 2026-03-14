/**
 * Безпечний виклик Meta Pixel fbq().
 * Якщо fbq ще не завантажений — чекає до 5 секунд (polling кожні 100ms).
 */
export function trackFbq(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  const fire = () => {
    if (typeof window.fbq === "function") {
      window.fbq("track", eventName, params);
      return true;
    }
    return false;
  };

  if (fire()) return;

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (fire() || attempts >= 50) {
      clearInterval(interval);
    }
  }, 100);
}
