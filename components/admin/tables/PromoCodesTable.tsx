"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Input from "@/components/admin/form/input/InputField";
import Label from "@/components/admin/form/Label";

type PromoCode = {
  id: number;
  code: string;
  name: string;
  discount_percent: number;
  is_active: boolean;
  usage_count: number;
  max_uses: number | null;
  note: string | null;
  created_at: string;
};

type StatusFilter = "all" | "active" | "inactive";

const emptyForm = {
  code: "",
  name: "",
  discount_percent: "10",
  max_uses: "",
  note: "",
  is_active: true,
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function usageLabel(row: PromoCode): string {
  if (row.max_uses != null) return `${row.usage_count} / ${row.max_uses}`;
  return `${row.usage_count}`;
}

function usagePct(row: PromoCode): number | null {
  if (row.max_uses == null || row.max_uses <= 0) return null;
  return Math.min(100, Math.round((row.usage_count / row.max_uses) * 100));
}

export default function PromoCodesTable() {
  const [rows, setRows] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Не вдалося завантажити промокоди");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let totalUses = 0;
    for (const row of rows) {
      if (row.is_active) active += 1;
      else inactive += 1;
      totalUses += Number(row.usage_count) || 0;
    }
    return { all: rows.length, active, inactive, totalUses };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return rows.filter((row) => {
      if (statusFilter === "active" && !row.is_active) return false;
      if (statusFilter === "inactive" && row.is_active) return false;
      if (!q) return true;
      return (
        row.code.toUpperCase().includes(q) ||
        row.name.toUpperCase().includes(q) ||
        (row.note || "").toUpperCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (row: PromoCode) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      discount_percent: String(row.discount_percent),
      max_uses: row.max_uses != null ? String(row.max_uses) : "",
      note: row.note || "",
      is_active: row.is_active,
    });
    setError(null);
    setSuccess(null);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      code: form.code,
      name: form.name,
      discount_percent: Number(form.discount_percent),
      max_uses: form.max_uses.trim() === "" ? null : Number(form.max_uses),
      note: form.note.trim() || null,
      is_active: form.is_active,
    };

    try {
      const res = await fetch(
        editingId
          ? `/api/admin/promo-codes/${editingId}`
          : "/api/admin/promo-codes",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "save failed");
      }
      setSuccess(editingId ? "Промокод оновлено" : "Промокод створено");
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: PromoCode) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !row.is_active }),
      });
      if (!res.ok) throw new Error("toggle failed");
      await load();
    } catch {
      setError("Не вдалося змінити статус");
    }
  };

  const handleDelete = async (row: PromoCode) => {
    if (!confirm(`Видалити промокод ${row.code}?`)) return;
    try {
      const res = await fetch(`/api/admin/promo-codes/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      if (editingId === row.id) resetForm();
      await load();
    } catch {
      setError("Не вдалося видалити");
    }
  };

  const copyCode = async (row: PromoCode) => {
    try {
      await navigator.clipboard.writeText(row.code);
      setCopiedId(row.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setError("Не вдалося скопіювати код");
    }
  };

  const filterButtons: { key: StatusFilter; label: string }[] = [
    { key: "all", label: `Усі (${counts.all})` },
    { key: "active", label: `Активні (${counts.active})` },
    { key: "inactive", label: `Вимкнені (${counts.inactive})` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500">Кодів</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {counts.all}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Активні
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {counts.active}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Використань
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {counts.totalUses}
          </p>
        </div>
      </div>

      <div
        ref={formRef}
        className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {editingId ? "Редагувати промокод" : "Новий промокод"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Персональний код для стиліста — знижка застосовується на
              оформленні
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 underline-offset-2 hover:underline"
            >
              Скасувати редагування
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Код *</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                }))
              }
              placeholder="ANNA15"
            />
          </div>
          <div>
            <Label>Назва / стиліст *</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Анна — стиліст"
            />
          </div>
          <div>
            <Label>Знижка, % *</Label>
            <div className="mb-2 flex flex-wrap gap-2">
              {[10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, discount_percent: String(pct) }))
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    form.discount_percent === String(pct)
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-300 text-gray-700 hover:border-brand-400 dark:border-white/20 dark:text-gray-300"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <Input
              type="number"
              min="1"
              max="100"
              value={form.discount_percent}
              onChange={(e) =>
                setForm((f) => ({ ...f, discount_percent: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Макс. використань</Label>
            <Input
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_uses: e.target.value }))
              }
              placeholder="Порожньо = безліміт"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Нотатка</Label>
            <Input
              value={form.note}
              onChange={(e) =>
                setForm((f) => ({ ...f, note: e.target.value }))
              }
              placeholder="Опційно — внутрішній коментар"
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() =>
                setForm((f) => ({ ...f, is_active: !f.is_active }))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.is_active ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.is_active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {form.is_active ? "Активний" : "Вимкнений"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={
                saving || !form.code.trim() || !form.name.trim()
              }
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
              {saving
                ? "Збереження..."
                : editingId
                  ? "Зберегти зміни"
                  : "Створити промокод"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-white/20"
              >
                Скасувати
              </button>
            )}
          </div>
        </form>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Список промокодів
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Пошук, копіювання, деактивація
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за кодом чи імʼям…"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-4 py-3 dark:border-white/[0.05]">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              type="button"
              onClick={() => setStatusFilter(button.key)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                statusFilter === button.key
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">Завантаження...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            {rows.length === 0
              ? "Промокодів ще немає — створіть перший вище"
              : "Нічого не знайдено за фільтром"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Код
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Стиліст
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Знижка
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Використано
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Статус
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Створено
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      Дії
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const pct = usagePct(row);
                    return (
                      <TableRow
                        key={row.id}
                        className="border-b border-gray-50 dark:border-white/[0.03]"
                      >
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold tracking-wide text-gray-900 dark:text-white">
                              {row.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyCode(row)}
                              className="rounded px-1.5 py-0.5 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10"
                              title="Копіювати"
                            >
                              {copiedId === row.id ? "Скопійовано" : "Копіювати"}
                            </button>
                          </div>
                          {row.note && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                              {row.note}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                          {row.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-[#072a6b]/10 px-2 py-0.5 text-sm font-medium text-[#072a6b] dark:bg-[#072a6b]/30 dark:text-[#9eb6d9]">
                            −{row.discount_percent}%
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="min-w-[100px]">
                            <p className="text-sm text-gray-800 dark:text-white/90">
                              {usageLabel(row)}
                              {row.max_uses == null && (
                                <span className="text-gray-400"> · ∞</span>
                              )}
                            </p>
                            {pct != null && (
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                <div
                                  className={`h-full rounded-full ${
                                    pct >= 100
                                      ? "bg-red-500"
                                      : pct >= 80
                                        ? "bg-amber-500"
                                        : "bg-brand-500"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              row.is_active
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {row.is_active ? "Активний" : "Вимкнено"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(row.created_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
                            >
                              Редагувати
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(row)}
                              className="rounded-lg border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
                            >
                              {row.is_active ? "Вимкнути" : "Увімкнути"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                              Видалити
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
