"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesByCategoryId, setSubcategoriesByCategoryId] = useState<
    Record<number, { id: number; name: string }[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [newCategoryNameDe, setNewCategoryNameDe] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNameEn, setEditingNameEn] = useState("");
  const [editingNameDe, setEditingNameDe] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showNewLocales, setShowNewLocales] = useState(false);
  const [showEditingLocales, setShowEditingLocales] = useState(false);
  const [isTranslatingNew, setIsTranslatingNew] = useState(false);
  const [isTranslatingEdit, setIsTranslatingEdit] = useState(false);

  // --- Simple translators (Google + MyMemory), same підхід як у товарах ---
  const translateWithGoogleFree = async (
    text: string,
    targetLang: "en" | "de",
    sourceLang: "uk" | "en" | "de" = "uk"
  ): Promise<string> => {
    if (!text || !text.trim()) return "";

    const langMap: Record<string, string> = {
      uk: "uk",
      en: "en",
      de: "de",
    };

    const source = langMap[sourceLang] ?? "uk";
    const target = langMap[targetLang] ?? "en";

    if (source === target) return text;

    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: source,
        tl: target,
        dt: "t",
        q: text,
      });
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?${params.toString()}`
      );
      if (!res.ok) return text;
      const data = await res.json();
      if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        const translated = (data[0] as unknown[])
          .map((item) => (Array.isArray(item) ? item[0] : ""))
          .join("");
        return (translated || "").trim();
      }
    } catch (e) {
      console.warn("Category translation error (google):", e);
    }
    return text;
  };

  const translateWithMyMemory = async (
    text: string,
    targetLang: "en" | "de",
    sourceLang: "uk" | "en" | "de" = "uk"
  ): Promise<string> => {
    if (!text || !text.trim()) return "";

    const langMap: Record<string, string> = {
      uk: "uk-UA",
      en: "en-US",
      de: "de-DE",
    };

    const source = langMap[sourceLang] ?? "uk-UA";
    const target = langMap[targetLang] ?? "en-US";

    if (source === target) return text;

    try {
      const params = new URLSearchParams({
        q: text,
        langpair: `${source}|${target}`,
      });
      const res = await fetch(
        `https://api.mymemory.translated.net/get?${params.toString()}`
      );
      if (!res.ok) return text;
      const data = await res.json();
      if (data?.responseStatus === 200) {
        const translated = data?.responseData?.translatedText;
        if (
          translated &&
          typeof translated === "string" &&
          translated.toLowerCase() !== text.toLowerCase()
        ) {
          return translated.trim();
        }
      }
    } catch (e) {
      console.warn("Category translation error (mymemory):", e);
    }
    return text;
  };

  const autoTranslateName = async (
    baseText: string
  ): Promise<{ en: string; de: string }> => {
    if (!baseText || !baseText.trim()) {
      return { en: "", de: "" };
    }
    const src = "uk" as const;
    let en = await translateWithGoogleFree(baseText, "en", src);
    let de = await translateWithGoogleFree(baseText, "de", src);
    if (!en || en === baseText) {
      en = await translateWithMyMemory(baseText, "en", src);
    }
    if (!de || de === baseText) {
      de = await translateWithMyMemory(baseText, "de", src);
    }
    return { en: en || baseText, de: de || baseText };
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);

      if (Array.isArray(data) && data.length > 0) {
        const map: Record<number, { id: number; name: string }[]> = {};
        await Promise.all(
          data.map(async (cat: Category) => {
            try {
              const subRes = await fetch(
                `/api/subcategories?parent_category_id=${cat.id}`
              );
              if (!subRes.ok) return;
              const subs = await subRes.json();
              map[cat.id] = Array.isArray(subs) ? subs : [];
            } catch {
              map[cat.id] = [];
            }
          })
        );
        setSubcategoriesByCategoryId(map);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      alert("Введіть назву категорії");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          name_en: newCategoryNameEn.trim() || null,
          name_de: newCategoryNameDe.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create category");
      
      const newCategory = await res.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setNewCategoryNameEn("");
      setNewCategoryNameDe("");
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Помилка при створенні категорії");
    }
  }

  async function handleUpdateCategory(
    id: number,
    name: string,
    nameEn: string,
    nameDe: string
  ) {
    if (!name.trim()) {
      alert("Введіть назву категорії");
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          name_en: nameEn.trim() || null,
          name_de: nameDe.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update category");

      const updatedCategory = await res.json();
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      setEditingId(null);
      setEditingName("");
      setEditingNameEn("");
      setEditingNameDe("");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Помилка при оновленні категорії");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete category");

      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Помилка при видаленні категорії");
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditingNameEn("");
    setEditingNameDe("");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Категорії
            </h2>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-block rounded-md bg-green-400 px-4 py-2 text-white text-sm hover:bg-green-600 transition"
            >
              + Додати категорію
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Назва
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Підкатегорії
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {/* Add new category row */}
              {isAddingNew && (
                <TableRow className="bg-green-50 dark:bg-green-900/10">
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    —
                  </TableCell>
                  <TableCell className="px-5 py-4" colSpan={2}>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddCategory();
                          if (e.key === "Escape") {
                            setIsAddingNew(false);
                            setNewCategoryName("");
                            setNewCategoryNameEn("");
                            setNewCategoryNameDe("");
                            setShowNewLocales(false);
                          }
                        }}
                        placeholder="Введіть назву категорії (UA)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setShowNewLocales((v) => !v)}
                      >
                        {showNewLocales
                          ? "Сховати локалізації назви"
                          : "Додати локалізацію назви"}
                      </button>
                      {showNewLocales && (
                        <div className="space-y-1">
                          <button
                            type="button"
                            className="mb-1 text-xs text-purple-600 hover:underline"
                            disabled={isTranslatingNew}
                            onClick={async () => {
                              if (!newCategoryName.trim()) return;
                              try {
                                setIsTranslatingNew(true);
                                const res = await autoTranslateName(
                                  newCategoryName
                                );
                                setNewCategoryNameEn(res.en);
                                setNewCategoryNameDe(res.de);
                              } finally {
                                setIsTranslatingNew(false);
                              }
                            }}
                          >
                            {isTranslatingNew
                              ? "Переклад назви..."
                              : "Автоматично перекласти назву EN/DE"}
                          </button>
                          <input
                            type="text"
                            value={newCategoryNameEn}
                            onChange={(e) =>
                              setNewCategoryNameEn(e.target.value)
                            }
                            placeholder="Назва (EN)"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            value={newCategoryNameDe}
                            onChange={(e) =>
                              setNewCategoryNameDe(e.target.value)
                            }
                            placeholder="Назва (DE)"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 space-x-2">
                    <button
                      onClick={handleAddCategory}
                      className="inline-block rounded-md bg-green-500 px-3 py-1 text-white text-sm hover:bg-green-600 transition"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewCategoryName("");
                      }}
                      className="inline-block rounded-md bg-gray-400 px-3 py-1 text-white text-sm hover:bg-gray-600 transition"
                    >
                      Скасувати
                    </button>
                  </TableCell>
                </TableRow>
              )}

              {/* Loading state */}
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Категорій не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {category.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {editingId === category.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter")
                                handleUpdateCategory(
                                  category.id,
                                  editingName,
                                  editingNameEn,
                                  editingNameDe
                                );
                              if (e.key === "Escape") cancelEditing();
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() =>
                              setShowEditingLocales((v) => !v)
                            }
                          >
                            {showEditingLocales
                              ? "Сховати локалізації назви"
                              : "Додати локалізацію назви"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {category.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {(() => {
                        const subs =
                          subcategoriesByCategoryId[category.id] ?? [];
                        const count = subs.length;
                        return (
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {count === 0
                              ? "Додати підкатегорії"
                              : `${count} підк. → Редагувати`}
                          </Link>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">
                      {editingId === category.id ? (
                        showEditingLocales && (
                          <div className="space-y-1">
                            <button
                              type="button"
                              className="mb-1 text-xs text-purple-600 hover:underline"
                              disabled={isTranslatingEdit}
                              onClick={async () => {
                                if (!editingName.trim()) return;
                                try {
                                  setIsTranslatingEdit(true);
                                  const res = await autoTranslateName(
                                    editingName
                                  );
                                  setEditingNameEn(res.en);
                                  setEditingNameDe(res.de);
                                } finally {
                                  setIsTranslatingEdit(false);
                                }
                              }}
                            >
                              {isTranslatingEdit
                                ? "Переклад назви..."
                                : "Автоматично перекласти назву EN/DE"}
                            </button>
                            <input
                              type="text"
                              value={editingNameEn}
                              onChange={(e) =>
                                setEditingNameEn(e.target.value)
                              }
                              placeholder="EN"
                              className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={editingNameDe}
                              onChange={(e) =>
                                setEditingNameDe(e.target.value)
                              }
                              placeholder="DE"
                              className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span>
                            <span className="font-semibold">EN:</span>{" "}
                            {category.name_en || "—"}
                          </span>
                          <span>
                            <span className="font-semibold">DE:</span>{" "}
                            {category.name_de || "—"}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateCategory(
                                category.id,
                                editingName,
                                editingNameEn,
                                editingNameDe
                              )
                            }
                            className="inline-block rounded-md bg-blue-500 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                          >
                            Зберегти
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="inline-block rounded-md bg-gray-400 px-3 py-1 text-white text-sm hover:bg-gray-600 transition"
                          >
                            Скасувати
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(category.id);
                              setEditingName(category.name);
                              setEditingNameEn(category.name_en || "");
                              setEditingNameDe(category.name_de || "");
                            }}
                            className="inline-block rounded-md bg-blue-400 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                          >
                            Редагувати
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="inline-block rounded-md bg-red-400 px-3 py-1 text-white text-sm hover:bg-red-600 transition"
                          >
                            Видалити
                          </button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

