// /app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { SidebarProvider } from "@/lib/SidebarContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import ClientLayoutShell from "@/components/admin/ClientLayoutShell";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
