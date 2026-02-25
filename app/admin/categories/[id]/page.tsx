"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";

type Subcategory = {
  id?: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  category_id?: number | null;
};

type RecommendationRule = {
  type: "category" | "subcategory";
  category_id?: number | null;
  subcategory_id?: number | null;
  priority: number;
};

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params?.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletedSubcategoryIds, setDeletedSubcategoryIds] = useState<number[]>(
    []
  );

  const [formData, setFormData] = useState({
    name: "",
    priority: 0, // <-- add this
    subcategories: [] as Subcategory[],
    recommendations: [] as RecommendationRule[],
  });

  const [allCategories, setAllCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [allSubcategories, setAllSubcategories] = useState<
    { id: number; name: string; category_id: number | null }[]
  >([]);

  const [isTranslatingSub, setIsTranslatingSub] = useState<
    Record<number, boolean>
  >({});
  const [isTranslatingAllSubs, setIsTranslatingAllSubs] =
    useState<boolean>(false);

  // Автоматичний переклад назв підкатегорій (UA -> EN/DE)
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
      console.warn("Subcategory translation error (google):", e);
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
      console.warn("Subcategory translation error (mymemory):", e);
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

  // Fetch category + its subcategories
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [categoryRes, subcategoriesRes, categoriesRes, allSubsRes] =
          await Promise.all([
            fetch(`/api/categories/${categoryId}`),
            fetch(`/api/subcategories?parent_category_id=${categoryId}`),
            fetch("/api/categories"),
            fetch("/api/subcategories/all"),
          ]);

        if (
          !categoryRes.ok ||
          !subcategoriesRes.ok ||
          !categoriesRes.ok ||
          !allSubsRes.ok
        )
          throw new Error("Failed to fetch data");

        const category = await categoryRes.json();
        const subcategories = await subcategoriesRes.json();
        const categories = await categoriesRes.json();
        const allSubs = await allSubsRes.json();

        let recommendations: RecommendationRule[] = [];
        if (category.recommended_look_config) {
          try {
            const parsed = JSON.parse(category.recommended_look_config);
            if (Array.isArray(parsed)) {
              recommendations = parsed
                .map((item) => {
                  // New format with type
                  if (
                    (item.type === "category" ||
                      item.type === "subcategory") &&
                    typeof item.priority === "number"
                  ) {
                    return {
                      type: item.type as "category" | "subcategory",
                      category_id:
                        item.type === "category" &&
                        typeof item.category_id === "number"
                          ? item.category_id
                          : null,
                      subcategory_id:
                        item.type === "subcategory" &&
                        typeof item.subcategory_id === "number"
                          ? item.subcategory_id
                          : null,
                      priority: item.priority ?? 0,
                    } as RecommendationRule;
                  }

                  // Backwards compatibility: { target_category_id, priority }
                  if (typeof item.target_category_id === "number") {
                    return {
                      type: "category",
                      category_id: item.target_category_id,
                      subcategory_id: null,
                      priority:
                        typeof item.priority === "number" ? item.priority : 0,
                    } as RecommendationRule;
                  }

                  return null;
                })
                .filter(
                  (r): r is RecommendationRule =>
                    !!r &&
                    ((r.type === "category" && r.category_id != null) ||
                      (r.type === "subcategory" && r.subcategory_id != null))
                );
            }
          } catch {
            // ignore parse errors, keep empty recommendations
          }
        }

        setFormData({
          name: category.name,
          priority: category.priority ?? 0,
          subcategories: subcategories || [],
          recommendations,
        });
        setAllCategories(
          (Array.isArray(categories) ? categories : []).map(
            (c: { id: number; name: string }) => ({ id: c.id, name: c.name })
          )
        );
        setAllSubcategories(
          (Array.isArray(allSubs) ? allSubs : []).map(
            (s: { id: number; name: string; category_id?: number | null }) => ({
              id: s.id,
              name: s.name,
              category_id:
                typeof s.category_id === "number" ? s.category_id : null,
            })
          )
        );
      } catch (err) {
        console.error(err);
        setError("Помилка при завантаженні категорії");
      } finally {
        setLoadingData(false);
      }
    }

    if (!isNaN(categoryId)) fetchData();
  }, [categoryId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "priority" ? Number(value) : value,
    }));
  };

  const [showSubLocales, setShowSubLocales] = useState<Record<number, boolean>>(
    {}
  );
  const toggleSubLocales = (index: number) => {
    setShowSubLocales((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubcategoryChange = (
    index: number,
    field: keyof Subcategory,
    value: string | null
  ) => {
    setFormData((prev) => {
      const newSubs = [...prev.subcategories];
      newSubs[index] = {
        ...newSubs[index],
        [field]: value === "" || value === null ? undefined : value,
      };
      return { ...prev, subcategories: newSubs };
    });
  };

  const handleSubcategoryNameChange = (index: number, value: string) => {
    handleSubcategoryChange(index, "name", value);
  };

  const handleAutoTranslateSubcategory = async (index: number) => {
    const sub = formData.subcategories[index];
    const base = sub?.name?.trim();
    if (!base) return;

    try {
      setIsTranslatingSub((prev) => ({ ...prev, [index]: true }));
      const res = await autoTranslateName(base);
      handleSubcategoryChange(index, "name_en", res.en);
      handleSubcategoryChange(index, "name_de", res.de);
    } finally {
      setIsTranslatingSub((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleAddSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, { name: "" }],
    }));
  };

  const handleAutoTranslateAllSubcategories = async () => {
    const currentSubs = formData.subcategories;
    if (!currentSubs.length) return;

    setIsTranslatingAllSubs(true);
    try {
      const updatedSubs = [...currentSubs];

      await Promise.all(
        updatedSubs.map(async (sub, index) => {
          const base = sub.name?.trim();
          if (!base) return;

          const needEn = !sub.name_en || !sub.name_en.trim();
          const needDe = !sub.name_de || !sub.name_de.trim();
          if (!needEn && !needDe) return;

          const res = await autoTranslateName(base);
          updatedSubs[index] = {
            ...sub,
            name_en: needEn ? res.en : sub.name_en,
            name_de: needDe ? res.de : sub.name_de,
          };
        })
      );

      setFormData((prev) => ({
        ...prev,
        subcategories: updatedSubs,
      }));
    } finally {
      setIsTranslatingAllSubs(false);
    }
  };

  const handleRecommendationTypeChange = (
    index: number,
    type: "category" | "subcategory"
  ) => {
    setFormData((prev) => {
      const updated = [...prev.recommendations];
      const current = updated[index] || {
        type,
        category_id: null,
        subcategory_id: null,
        priority: 0,
      };
      updated[index] = {
        ...current,
        type,
        // при зміні типу скидаємо протилежний ID
        category_id: type === "category" ? current.category_id ?? null : null,
        subcategory_id:
          type === "subcategory" ? current.subcategory_id ?? null : null,
      };
      return { ...prev, recommendations: updated };
    });
  };

  const handleRecommendationCategoryChange = (
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.recommendations];
      const current =
        updated[index] || ({
          type: "category",
          category_id: null,
          subcategory_id: null,
          priority: 0,
        } as RecommendationRule);
      updated[index] = {
        ...current,
        type: "category",
        category_id: value ? Number(value) : null,
      };
      return { ...prev, recommendations: updated };
    });
  };

  const handleRecommendationSubcategoryChange = (
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.recommendations];
      const current =
        updated[index] || ({
          type: "subcategory",
          category_id: null,
          subcategory_id: null,
          priority: 0,
        } as RecommendationRule);
      updated[index] = {
        ...current,
        type: "subcategory",
        subcategory_id: value ? Number(value) : null,
      };
      return { ...prev, recommendations: updated };
    });
  };

  const handleRecommendationPriorityChange = (
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.recommendations];
      const current =
        updated[index] ||
        ({
          type: "category",
          category_id: null,
          subcategory_id: null,
          priority: 0,
        } as RecommendationRule);
      updated[index] = {
        ...current,
        priority: Number(value) || 0,
      };
      return { ...prev, recommendations: updated };
    });
  };

  const handleAddRecommendation = () => {
    setFormData((prev) => ({
      ...prev,
      recommendations: [
        ...prev.recommendations,
        { type: "category", category_id: null, subcategory_id: null, priority: 0 },
      ],
    }));
  };

  const handleRemoveRecommendation = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.recommendations];
      updated.splice(index, 1);
      return { ...prev, recommendations: updated };
    });
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData((prev) => {
      const subToRemove = prev.subcategories[index];
      const updated = [...prev.subcategories];
      updated.splice(index, 1);

      if (subToRemove.id) {
        // Track it for deletion
        setDeletedSubcategoryIds((prevIds) => [...prevIds, subToRemove.id!]);
        console.log(deletedSubcategoryIds);
      }

      return { ...prev, subcategories: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const { name, subcategories, recommendations } = formData;

      if (!name.trim()) {
        setError("Назва категорії не може бути порожньою");
        setLoading(false);
        return;
      }

      // Update category name & recommendation config
      const categoryRes = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          priority: formData.priority,
          recommended_look_config: JSON.stringify(
            recommendations.filter(
              (r) =>
                (r.type === "category" && r.category_id != null) ||
                (r.type === "subcategory" && r.subcategory_id != null)
            )
          ),
        }),
      });

      if (!categoryRes.ok) throw new Error("Failed to update category");

      // Delete subcategories
      for (const subId of deletedSubcategoryIds) {
        await fetch(`/api/subcategories/${subId}`, {
          method: "DELETE",
        });
      }

      for (const sub of subcategories) {
        const trimmedName = sub.name.trim();
        if (!trimmedName) continue;

        if (sub.id) {
          await fetch(`/api/subcategories/${sub.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              parent_category_id: categoryId,
              name_en: sub.name_en?.trim() || null,
              name_de: sub.name_de?.trim() || null,
            }),
          });
        } else {
          await fetch(`/api/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              parent_category_id: categoryId,
              name_en: sub.name_en?.trim() || null,
              name_de: sub.name_de?.trim() || null,
            }),
          });
        }
      }

      setSuccess("Категорію успішно оновлено");
      router.push("/admin/categories");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити категорію");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Категорію" />

          <div className="max-w-2xl mx-auto p-4">
            <ComponentCard title="Редагування Категорії">
              <Label>Назва категорії</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <Label className="mt-4">Пріоритет</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              />

              <Label className="mt-6">Підкатегорії</Label>
              <button
                type="button"
                className="mt-1 mb-2 text-xs text-purple-600 hover:underline"
                disabled={isTranslatingAllSubs}
                onClick={handleAutoTranslateAllSubcategories}
              >
                {isTranslatingAllSubs
                  ? "Переклад усіх підкатегорій..."
                  : "Автоматично згенерувати локалізації для всіх підкатегорій"}
              </button>
              {formData.subcategories.map((sub, index) => (
                <div
                  key={sub.id ?? `new-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={sub.name}
                      onChange={(e) =>
                        handleSubcategoryNameChange(index, e.target.value)
                      }
                      placeholder="Назва підкатегорії (UA)"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      className="text-red-600 font-bold px-2 shrink-0"
                      onClick={() => handleRemoveSubcategory(index)}
                      title="Видалити"
                    >
                      ×
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => toggleSubLocales(index)}
                  >
                    {showSubLocales[index]
                      ? "Сховати локалізації назви"
                      : "Додати локалізацію назви"}
                  </button>
                  {showSubLocales[index] && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                      <div className="col-span-1 sm:col-span-2">
                        <button
                          type="button"
                          className="mb-1 text-xs text-purple-600 hover:underline"
                          disabled={!!isTranslatingSub[index]}
                          onClick={() => handleAutoTranslateSubcategory(index)}
                        >
                          {isTranslatingSub[index]
                            ? "Переклад назви..."
                            : "Автоматично перекласти назву EN/DE"}
                        </button>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Назва (EN)
                        </label>
                        <Input
                          type="text"
                          value={sub.name_en ?? ""}
                          onChange={(e) =>
                            handleSubcategoryChange(
                              index,
                              "name_en",
                              e.target.value
                            )
                          }
                          placeholder="Subcategory name (EN)"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Назва (DE)
                        </label>
                        <Input
                          type="text"
                          value={sub.name_de ?? ""}
                          onChange={(e) =>
                            handleSubcategoryChange(
                              index,
                              "name_de",
                              e.target.value
                            )
                          }
                          placeholder="Unterkategorie (DE)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSubcategory}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
              >
                Додати підкатегорію
              </button>

              <Label className="mt-8">
                Рекомендації &quot;Доповніть LOOK&quot;
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Оберіть, з яких категорій підбирати товари для блоку
                &quot;Доповніть LOOK&quot; на сторінці товару цієї категорії.
                Більший пріоритет показується раніше.
              </p>
              {formData.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-3 space-y-2 flex flex-col sm:flex-row gap-2 sm:items-center"
                >
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">
                      Тип рекомендації
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-2"
                      value={rec.type}
                      onChange={(e) =>
                        handleRecommendationTypeChange(
                          index,
                          e.target.value === "subcategory"
                            ? "subcategory"
                            : "category"
                        )
                      }
                    >
                      <option value="category">Категорія</option>
                      <option value="subcategory">Підкатегорія</option>
                    </select>

                    {rec.type === "category" ? (
                      <>
                        <label className="text-xs text-gray-500 block mb-1">
                          Категорія для рекомендацій
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          value={rec.category_id ?? ""}
                          onChange={(e) =>
                            handleRecommendationCategoryChange(
                              index,
                              e.target.value
                            )
                          }
                        >
                          <option value="">— Оберіть категорію —</option>
                          {allCategories
                            .filter((c) => c.id !== categoryId)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="text-xs text-gray-500 block mb-1">
                          Підкатегорія для рекомендацій
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          value={rec.subcategory_id ?? ""}
                          onChange={(e) =>
                            handleRecommendationSubcategoryChange(
                              index,
                              e.target.value
                            )
                          }
                        >
                          <option value="">— Оберіть підкатегорію —</option>
                          {allSubcategories.map((s) => {
                            const parent =
                              allCategories.find(
                                (c) => c.id === s.category_id
                              ) || null;
                            const label = parent
                              ? `${parent.name} — ${s.name}`
                              : s.name;
                            return (
                              <option key={s.id} value={s.id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </>
                    )}
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-gray-500 block mb-1">
                      Пріоритет
                    </label>
                    <Input
                      type="number"
                      value={rec.priority}
                      onChange={(e) =>
                        handleRecommendationPriorityChange(
                          index,
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="text-red-600 font-bold px-2 self-start mt-5 sm:mt-6"
                    onClick={() => handleRemoveRecommendation(index)}
                    title="Видалити правило"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddRecommendation}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Додати рекомендацію
              </button>
            </ComponentCard>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Збереження..." : "Зберегти"}
              </button>
            </div>

            {success && (
              <div className="text-green-600 text-center mt-4">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-4">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
