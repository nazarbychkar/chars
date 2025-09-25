// /components/ClientLayoutShell.tsx
"use client";

import { useSidebar } from '@/lib/SidebarContext';
import AppSidebar from '@/components/admin/AppSidebar';
import AppHeader from '@/components/admin/AppHeader';
import Backdrop from '@/components/admin/Backdrop';
import React from 'react';

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[290px]'
    : 'lg:ml-[90px]';

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-[--breakpoint-2xl] md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
