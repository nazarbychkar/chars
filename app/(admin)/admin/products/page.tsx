import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ProductsTable from "@/components/admin/tables/ProductsTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Таблиця Продуктів" />
      <div className="space-y-6">
        <ComponentCard title="Таблиця Продуктів">
          <ProductsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
