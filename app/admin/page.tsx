import type { Metadata } from "next";
import React from "react";
import { EcommerceMetrics } from "@/components/admin/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/MonthlySalesChart";
import RecentOrders from "@/components/admin/RecentOrders";

export const metadata: Metadata = {
  title: "CHARS — Admin",
  description: "CHARS admin dashboard",
};

export default function Ecommerce() {
  return (
    <div className="col-span-12 space-y-6 xl:col-span-7">
      <EcommerceMetrics />
      <MonthlySalesChart />
      <RecentOrders />
    </div>
  );
}
