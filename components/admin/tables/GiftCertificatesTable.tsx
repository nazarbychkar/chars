"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "./Pagination";

type CertificateStatusFilter = "all" | "unused" | "used";

interface GiftCertificate {
  id: number;
  code: string;
  purchase_order_id: number;
  initial_balance: string | number;
  remaining_balance: string | number;
  currency: "UAH" | "EUR";
  status: string;
  recipient_name: string | null;
  recipient_email: string | null;
  customer_name: string | null;
  phone_number: string | null;
  order_email: string | null;
  created_at: string;
  expires_at: string;
}

function getUsageStatus(cert: GiftCertificate): "unused" | "partial" | "used" {
  const initial = Number(cert.initial_balance);
  const remaining = Number(cert.remaining_balance);

  if (cert.status === "depleted" || remaining <= 0) {
    return "used";
  }
  if (remaining < initial) {
    return "partial";
  }
  return "unused";
}

function getStatusLabel(status: ReturnType<typeof getUsageStatus>): string {
  switch (status) {
    case "unused":
      return "Не використаний";
    case "partial":
      return "Частково використаний";
    case "used":
      return "Використано";
  }
}

function getStatusClass(status: ReturnType<typeof getUsageStatus>): string {
  switch (status) {
    case "unused":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "partial":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "used":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: string | number, currency: "UAH" | "EUR"): string {
  const symbol = currency === "EUR" ? "€" : "₴";
  return `${Number(amount).toLocaleString("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${symbol}`;
}

export default function GiftCertificatesTable() {
  const [certificates, setCertificates] = useState<GiftCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CertificateStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 10;

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const res = await fetch("/api/gift-certificates");
        if (!res.ok) throw new Error("Failed to fetch certificates");
        const data = await res.json();
        setCertificates(data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const usage = getUsageStatus(cert);
      if (filter === "unused") {
        return usage === "unused" || usage === "partial";
      }
      if (filter === "used") {
        return usage === "used";
      }
      return true;
    });
  }, [certificates, filter]);

  const counts = useMemo(() => {
    let unused = 0;
    let used = 0;
    for (const cert of certificates) {
      const usage = getUsageStatus(cert);
      if (usage === "used") used += 1;
      else unused += 1;
    }
    return { all: certificates.length, unused, used };
  }, [certificates]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCertificates.length / certificatesPerPage)
  );

  const paginatedCertificates = useMemo(
    () =>
      filteredCertificates.slice(
        (currentPage - 1) * certificatesPerPage,
        currentPage * certificatesPerPage
      ),
    [filteredCertificates, currentPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const filterButtons: { key: CertificateStatusFilter; label: string }[] = [
    { key: "all", label: `Усі (${counts.all})` },
    { key: "unused", label: `Не використані (${counts.unused})` },
    { key: "used", label: `Використані (${counts.used})` },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Подарункові сертифікати
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Коди, номінали та статус використання
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              type="button"
              onClick={() => {
                setFilter(button.key);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                filter === button.key
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Код</TableCell>
                <TableCell isHeader>Статус</TableCell>
                <TableCell isHeader>Номінал</TableCell>
                <TableCell isHeader>Залишок</TableCell>
                <TableCell isHeader>Покупець</TableCell>
                <TableCell isHeader>Email</TableCell>
                <TableCell isHeader>Телефон</TableCell>
                <TableCell isHeader>Куплено</TableCell>
                <TableCell isHeader>Діє до</TableCell>
                <TableCell isHeader>Замовлення</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10}>Завантаження...</TableCell>
                </TableRow>
              ) : paginatedCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10}>Сертифікатів не знайдено</TableCell>
                </TableRow>
              ) : (
                paginatedCertificates.map((cert) => {
                  const usage = getUsageStatus(cert);
                  const customer =
                    cert.recipient_name || cert.customer_name || "—";
                  const email =
                    cert.recipient_email || cert.order_email || "—";

                  return (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <span className="font-mono font-semibold tracking-wide">
                          {cert.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            usage
                          )}`}
                        >
                          {getStatusLabel(usage)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatAmount(cert.initial_balance, cert.currency)}
                      </TableCell>
                      <TableCell>
                        {formatAmount(cert.remaining_balance, cert.currency)}
                      </TableCell>
                      <TableCell>{customer}</TableCell>
                      <TableCell>{email}</TableCell>
                      <TableCell>{cert.phone_number || "—"}</TableCell>
                      <TableCell>{formatDate(cert.created_at)}</TableCell>
                      <TableCell>{formatDate(cert.expires_at)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${cert.purchase_order_id}/edit`}
                          className="text-brand-500 hover:underline"
                        >
                          #{cert.purchase_order_id}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!loading && filteredCertificates.length > certificatesPerPage && (
        <div className="border-t border-gray-200 p-4 dark:border-white/[0.05]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
