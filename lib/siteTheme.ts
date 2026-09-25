export type SiteTheme = "light" | "dark";

export function readStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* private mode / blocked storage */
  }
  return "light";
}

/** Apply theme classes on html + body (call on client only). */
export function applySiteTheme(theme: SiteTheme): void {
  if (typeof document === "undefined") return;

  const isDark = theme === "dark";
  const root = document.documentElement;
  const body = document.body;

  root.classList.toggle("dark-theme", isDark);
  root.classList.toggle("light-theme", !isDark);
  body.classList.toggle("dark-theme", isDark);
  body.classList.toggle("light-theme", !isDark);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", isDark ? "#1e1e1e" : "#072a6b");
  }

  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* ignore */
  }
}

export const SITE_THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark";var on="dark-theme";var off="light-theme";var r=document.documentElement;r.classList.add(d?on:off);r.classList.remove(d?off:on);}catch(e){document.documentElement.classList.add("light-theme");}})();`;
