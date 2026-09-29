"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ComponentCard from "@/components/admin/ComponentCard";
import Input from "@/components/admin/form/input/InputField";
import Label from "@/components/admin/form/Label";

type TopSaleRow = {
  id: number;
  name: string;
  top_sale_priority?: number;
};

export default function TopSaleOrderPage() {
  const [rows, setRows] = useState<TopSaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/top-sale");
        if (!res.ok) throw new Error("fetch failed");
        const data: TopSaleRow[] = await res.json();
        if (!cancelled) {
          setRows(
            data.map((p) => ({
              id: p.id,
              name: p.name,
              top_sale_priority: p.top_sale_priority ?? 0,
            }))
          );
        }
      } catch {
        if (!cancelled) setError("Не вдалося завантажити топ-товари");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedPreview = useMemo(() => {
    return [...rows].sort(
      (a, b) => (b.top_sale_priority ?? 0) - (a.top_sale_priority ?? 0)
    );
  }, [rows]);

  const setPriority = (id: number, value: string) => {
    const num = Number(value);
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, top_sale_priority: Number.isFinite(num) ? num : 0 }
          : r
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/top-sale", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((r) => ({
            id: r.id,
            top_sale_priority: r.top_sale_priority ?? 0,
          })),
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setSuccess("Порядок збережено");
    } catch {
      setError("Не вдалося зберегти");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Топ продаж — порядок" />
      <ComponentCard title="Порядок на головній">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Більше значення «Позиція» — вище в блоці «Топ продаж». Увімкніть
          «Топ продаж» у картці товару, щоб додати його сюди. Для категорії
          зі знижками створіть категорію Sale і додайте її в «Додаткові
          категорії» товару.
        </p>

        {loading && <p className="text-sm text-gray-500">Завантаження...</p>}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-2">{success}</p>}

        {!loading && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            Немає товарів з увімкненим «Топ продаж».
          </p>
        )}

        {!loading && rows.length > 0 && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Товар</th>
                    <th className="text-left px-3 py-2 font-medium w-36">
                      Позиція
                    </th>
                    <th className="text-left px-3 py-2 font-medium w-24" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 dark:border-white/5"
                    >
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          value={String(row.top_sale_priority ?? 0)}
                          onChange={(e) => setPriority(row.id, e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/products/${row.id}/edit`}
                          className="text-brand-500 hover:underline"
                        >
                          Редагувати
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Збереження..." : "Зберегти порядок"}
              </button>
            </div>

            <div className="mt-6">
              <Label>Попередній порядок на сайті</Label>
              <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                {sortedPreview.map((r) => (
                  <li key={r.id}>
                    {r.name}{" "}
                    <span className="text-gray-500">
                      ({r.top_sale_priority ?? 0})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
