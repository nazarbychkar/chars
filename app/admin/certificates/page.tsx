import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import GiftCertificatesTable from "@/components/admin/tables/GiftCertificatesTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сертифікати | CHARS Admin",
  description: "Управління подарунковими сертифікатами CHARS",
};

export default function CertificatesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Подарункові сертифікати" />
      <div className="space-y-6">
        <GiftCertificatesTable />
      </div>
    </div>
  );
}
