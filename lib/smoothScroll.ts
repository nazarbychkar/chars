// Smooth scroll utility for anchor links
export function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Initialize smooth scroll for all anchor links
export function initSmoothScroll() {
  if (typeof window === "undefined") return;

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a[href^='#']") as HTMLAnchorElement;
    
    if (link && link.href.startsWith(window.location.origin + "#")) {
      e.preventDefault();
      const id = link.getAttribute("href")?.substring(1);
      if (id) {
        smoothScrollTo(id);
      }
    }
  });
}

// CSS class for smooth scroll behavior
export const smoothScrollCSS = `
  html {
    scroll-behavior: smooth;
  }
  
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
`;
