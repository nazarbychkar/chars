import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import PromoCodesTable from "@/components/admin/tables/PromoCodesTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Промокоди | CHARS Admin",
  description: "Персональні промокоди стилістів CHARS",
};

export default function PromoCodesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Промокоди" />
      <div className="space-y-6">
        <PromoCodesTable />
      </div>
    </div>
  );
}
