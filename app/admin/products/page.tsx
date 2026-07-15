import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ProductsTable from "@/components/admin/tables/ProductsTable";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Таблиця Продуктів" />
      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03]">
              Завантаження...
            </div>
          }
        >
          <ProductsTable />
        </Suspense>
      </div>
    </div>
  );
}
