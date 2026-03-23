"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { RecommendProductThumb } from "@/components/admin/RecommendProductThumb";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";

const seasonOptions = ["Весна", "Літо", "Осінь", "Зима"];

const multiOptions = [
  { value: "ONESIZE", text: "ONESIZE", selected: false },
  { value: "XL", text: "XL", selected: false },
  { value: "L", text: "L", selected: false },
  { value: "M", text: "M", selected: false },
  { value: "S", text: "S", selected: false },
  { value: "XS", text: "XS", selected: false },
];

interface Category {
  id: number;
  name: string;
}

interface ProductOption {
  id: number;
  name: string;
  first_media?: { url: string; type: string } | null;
}

export default function FormElements() {
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameDe, setNameDe] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionDe, setDescriptionDe] = useState("");
  const [price, setPrice] = useState("");
  const [priceEur, setPriceEur] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [priority, setPriority] = useState("0");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  // const [images, setImages] = useState<File[]>([]);

  const [topSale, setTopSale] = useState(false);
  const [limitedEdition, setLimitedEdition] = useState(false);

  const [color, setColor] = useState("");
  const [colors, setColors] = useState<{ label: string; hex?: string }[]>([]);
  const [customColorLabel, setCustomColorLabel] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [availableColors, setAvailableColors] = useState<
    { color: string; hex?: string }[]
  >([]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [season, setSeason] = useState<string[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [recommendSearch, setRecommendSearch] = useState("");
  const [recommendedProductIds, setRecommendedProductIds] = useState<number[]>(
    []
  );

  type AvailabilityStatus = "available" | "sold_out" | "coming_soon";
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("available");

  const [fabricComposition, setFabricComposition] = useState("");
  const [fabricCompositionEn, setFabricCompositionEn] = useState("");
  const [fabricCompositionDe, setFabricCompositionDe] = useState("");
  const [hasLining, setHasLining] = useState(false);
  const [liningDescription, setLiningDescription] = useState("");
  const [liningDescriptionEn, setLiningDescriptionEn] = useState("");
  const [liningDescriptionDe, setLiningDescriptionDe] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showNameLocales, setShowNameLocales] = useState(false);
  const [showDescriptionLocales, setShowDescriptionLocales] = useState(false);
  const [showFabricLocales, setShowFabricLocales] = useState(false);
  const [showLiningLocales, setShowLiningLocales] = useState(false);
  const [isTranslatingName, setIsTranslatingName] = useState(false);
  const [isTranslatingDescription, setIsTranslatingDescription] =
    useState(false);
  const [isTranslatingFabric, setIsTranslatingFabric] = useState(false);
  const [isTranslatingLining, setIsTranslatingLining] = useState(false);

  // -------- Simple free translators (Google + MyMemory) --------
  const translateWithGoogleFree = async (
    text: string,
    targetLang: "uk" | "en" | "de",
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
      console.warn("Translation error (google):", e);
    }

    return text;
  };

  const translateWithMyMemory = async (
    text: string,
    targetLang: "uk" | "en" | "de",
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
      console.warn("Translation error (mymemory):", e);
    }

    return text;
  };

  const translateTextAllLangs = async (
    text: string,
    sourceLang: "uk" | "en" | "de" = "uk"
  ): Promise<{ uk: string; en: string; de: string }> => {
    if (!text || !text.trim()) {
      return { uk: "", en: "", de: "" };
    }

    const baseText = text.trim();

    const textUk =
      sourceLang === "uk"
        ? baseText
        : await translateWithGoogleFree(baseText, "uk", sourceLang);

    let textEn = await translateWithGoogleFree(baseText, "en", sourceLang);
    let textDe = await translateWithGoogleFree(baseText, "de", sourceLang);

    if (!textEn || textEn === baseText) {
      textEn = await translateWithMyMemory(baseText, "en", sourceLang);
    }
    if (!textDe || textDe === baseText) {
      textDe = await translateWithMyMemory(baseText, "de", sourceLang);
    }

    return {
      uk: textUk || baseText,
      en: textEn || baseText,
      de: textDe || baseText,
    };
  };

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        const data = await res.json();
        setAvailableColors(data);
      } catch (error) {
        console.error("Failed to fetch colors", error);
      }
    }

    fetchColors();
  }, []);

  useEffect(() => {
    async function fetchProductsForRecommendations() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: ProductOption[] = await res.json();
        setAllProducts(data);
      } catch (err) {
        console.error("Error fetching products for recommendations:", err);
      }
    }

    fetchProductsForRecommendations();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId(null);
      return;
    }

    async function fetchSubcategories() {
      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${categoryId}`
        );
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        const data: Category[] = await res.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    }

    fetchSubcategories();
  }, [categoryId]);

  type MediaFile = {
    file: File;
    type: "photo" | "video";
  };

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const handleDrop = (files: File[]) => {
    const newMedia = files.map((file) => {
      // Determine if file is video by mime type OR extension
      const isVideo = file.type.startsWith("video/") || 
        file.name.toLowerCase().endsWith('.webm') ||
        file.name.toLowerCase().endsWith('.mp4') ||
        file.name.toLowerCase().endsWith('.mov') ||
        file.name.toLowerCase().endsWith('.avi') ||
        file.name.toLowerCase().endsWith('.mkv') ||
        file.name.toLowerCase().endsWith('.flv') ||
        file.name.toLowerCase().endsWith('.wmv');
      
      console.log('[handleDrop] File:', file.name, 'Type:', file.type, 'Is video:', isVideo);
      
      return {
        file,
        type: (isVideo ? "video" : "photo") as MediaFile["type"],
      };
    });
    setMediaFiles((prev) => [...prev, ...newMedia]);
  };
// const handleDeleteMediaFile = (indexToRemove: number) => {
//   setMediaFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
// };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // 1) Upload images first (if any)
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];
      if (mediaFiles.length > 0) {
        const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB per file
        const totalSize = mediaFiles.reduce((sum, m) => sum + m.file.size, 0);
        const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total

        // Check individual file sizes
        for (const media of mediaFiles) {
          if (media.file.size > MAX_FILE_SIZE) {
            throw new Error(
              `Файл "${media.file.name}" занадто великий. Максимальний розмір одного файлу: 15MB.`
            );
          }
        }

        // Check total size
        if (totalSize > MAX_TOTAL_SIZE) {
          throw new Error(
            `Загальний розмір всіх файлів (${(totalSize / 1024 / 1024).toFixed(2)}MB) перевищує ліміт 100MB. Будь ласка, завантажте менше файлів або зменшіть їх розмір.`
          );
        }

        const uploadForm = new FormData();
        mediaFiles.forEach((m) => uploadForm.append("images", m.file));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ error: "Помилка завантаження файлів" }));
          throw new Error(errorData.error || "Помилка завантаження файлів");
        }

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media || [];
      }

      // 2) Convert sizes and stocks to the format expected by API
      const sizesWithStock = sizes.map((size) => ({
        size,
        stock: sizeStocks[size] ?? 0,
      }));

      // 3) Create product via JSON body (no files)
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          name_en: nameEn || null,
          name_de: nameDe || null,
          description,
          description_en: descriptionEn || null,
          description_de: descriptionDe || null,
          price: Number(price),
          price_eur: priceEur ? Number(priceEur) : null,
          old_price: oldPrice ? Number(oldPrice) : null,
          discount_percentage: discountPercentage
            ? Number(discountPercentage)
            : null,
          priority: Number(priority || 0),
          color,
          colors,
          sizes: sizesWithStock,
          top_sale: topSale,
          limited_edition: limitedEdition,
          season: season.length === 0 ? null : season,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          media: uploadedMedia,
          availability_status: availabilityStatus,
          fabric_composition: fabricComposition,
          fabric_composition_en: fabricCompositionEn || null,
          fabric_composition_de: fabricCompositionDe || null,
          has_lining: hasLining,
          lining_description: liningDescription,
          lining_description_en: liningDescriptionEn || null,
          lining_description_de: liningDescriptionDe || null,
          recommended_product_ids: recommendedProductIds,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || "Failed to create product");
      }

      setSuccess("Товар успішно створено!");
      setName("");
      setNameEn("");
      setNameDe("");
      setDescription("");
      setDescriptionEn("");
      setDescriptionDe("");
      setPrice("");
      setPriceEur("");
      setOldPrice("");
      setDiscountPercentage("");
      setPriority("0");
      setColor("");
      setColors([]);
      setSizes([]);
      setSizeStocks({});
      setMediaFiles([]);
      setTopSale(false);
      setLimitedEdition(false);
      setSeason([]);
      setCategoryId(null);
      setAvailabilityStatus("available");
      setFabricComposition("");
      setFabricCompositionEn("");
      setFabricCompositionDe("");
      setHasLining(false);
      setLiningDescription("");
      setLiningDescriptionEn("");
      setLiningDescriptionDe("");
      setSubcategoryId(null);
      setSubcategories([]);
      setRecommendedProductIds([]);
      setRecommendSearch("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка при створенні товару"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Додати Товар" />
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: inputs */}
          <div className="p-4">
            <ComponentCard title="Дані Товару">
              <div className="space-y-5">
                {/* Назва товару + локалізації */}
                <div>
                  <Label>Назва товару (UA)</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="mt-2 mb-2 text-xs text-blue-600 hover:underline"
                    onClick={() => setShowNameLocales((v) => !v)}
                  >
                    {showNameLocales
                      ? "Сховати локалізації назви"
                      : "Додати локалізацію назви"}
                  </button>
                  {showNameLocales && (
                    <>
                      <button
                        type="button"
                        className="mb-3 text-xs text-purple-600 hover:underline"
                        disabled={isTranslatingName}
                        onClick={async () => {
                          if (!name?.trim()) return;
                          try {
                            setIsTranslatingName(true);
                            const res = await translateTextAllLangs(name, "uk");
                            setNameEn(res.en);
                            setNameDe(res.de);
                          } finally {
                            setIsTranslatingName(false);
                          }
                        }}
                      >
                        {isTranslatingName
                          ? "Переклад назви..."
                          : "Автоматично перекласти назву EN/DE"}
                      </button>
                      <div className="space-y-2 mb-4">
                        <div>
                          <Label>Назва (EN)</Label>
                          <Input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="Product name in English"
                          />
                        </div>
                        <div>
                          <Label>Назва (DE)</Label>
                          <Input
                            type="text"
                            value={nameDe}
                            onChange={(e) => setNameDe(e.target.value)}
                            placeholder="Produktname auf Deutsch"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Опис + локалізації */}
                <div>
                  <Label>Опис (UA)</Label>
                  <TextArea
                    value={description}
                    onChange={setDescription}
                    rows={6}
                  />
                  <button
                    type="button"
                    className="mt-2 mb-2 text-xs text-blue-600 hover:underline"
                    onClick={() => setShowDescriptionLocales((v) => !v)}
                  >
                    {showDescriptionLocales
                      ? "Сховати локалізації опису"
                      : "Додати локалізацію опису"}
                  </button>
                  {showDescriptionLocales && (
                    <div className="space-y-2 mb-4">
                      <button
                        type="button"
                        className="mb-2 text-xs text-purple-600 hover:underline"
                        disabled={isTranslatingDescription}
                        onClick={async () => {
                          if (!description?.trim()) return;
                          try {
                            setIsTranslatingDescription(true);
                            const res = await translateTextAllLangs(
                              description,
                              "uk"
                            );
                            setDescriptionEn(res.en);
                            setDescriptionDe(res.de);
                          } finally {
                            setIsTranslatingDescription(false);
                          }
                        }}
                      >
                        {isTranslatingDescription
                          ? "Переклад опису..."
                          : "Автоматично перекласти опис EN/DE"}
                      </button>
                      <div>
                        <Label>Опис (EN)</Label>
                        <TextArea
                          value={descriptionEn}
                          onChange={setDescriptionEn}
                          rows={4}
                          placeholder="Product description in English"
                        />
                      </div>
                      <div>
                        <Label>Опис (DE)</Label>
                        <TextArea
                          value={descriptionDe}
                          onChange={setDescriptionDe}
                          rows={4}
                          placeholder="Produktbeschreibung auf Deutsch"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Ціна</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Поточна ціна"
                  />
                </div>
                <div>
                  <Label>Ціна в EUR (опціонально)</Label>
                  <Input
                    type="number"
                    value={priceEur}
                    onChange={(e) => setPriceEur(e.target.value)}
                    placeholder="Ціна в євро для EN/DE"
                  />
                </div>
                <div>
                  <Label>Стара ціна (опціонально)</Label>
                  <Input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="Ціна до знижки"
                  />
                </div>
                <div>
                  <Label>Відсоток знижки (опціонально)</Label>
                  <Input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="Наприклад: 20"
                  />
                </div>
                <div>
                  <Label>Пріоритет показу</Label>
                  <Input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="0 - звичайний, 1 - високий"
                  />
                </div>
                <div>
                  <MultiSelect
                    label="Розміри"
                    options={multiOptions}
                    defaultSelected={sizes}
                    onChange={(values: string[]) => {
                      setSizes(values);
                      // Ensure stocks exist for any newly added size
                      setSizeStocks((prev) => {
                        const next = { ...prev };
                        values.forEach((sz: string) => {
                          if (next[sz] === undefined) next[sz] = 0;
                        });
                        // Remove stocks for sizes no longer selected
                        Object.keys(next).forEach((sz) => {
                          if (!values.includes(sz)) delete next[sz];
                        });
                        return next;
                      });
                    }}
                    zIndex={51}
                  />
                </div>

                {/* Per-size stock editor */}
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Кількість на складі для кожного розміру</Label>
                    <div className="space-y-2">
                      {sizes.map((size) => (
                        <div key={size} className="flex items-center gap-2">
                          <Label className="w-20 mb-0">{size}:</Label>
                          <Input
                            type="number"
                            min="0"
                            value={sizeStocks[size] ?? 0}
                            onChange={(e) =>
                              setSizeStocks((prev) => ({
                                ...prev,
                                [size]: Math.max(0, parseInt(e.target.value) || 0),
                              }))
                            }
                            placeholder="0"
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Категорія</Label>
                  <select
                    value={categoryId ?? ""}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Виберіть категорію</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {subcategories.length > 0 && (
                  <div>
                    <Label>Підкатегорія</Label>
                    <select
                      value={subcategoryId ?? ""}
                      onChange={(e) => setSubcategoryId(Number(e.target.value))}
                      className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Виберіть підкатегорію</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <MultiSelect
                    label="Сезон"
                    options={seasonOptions.map((s) => ({
                      value: s,
                      text: s,
                      selected: season.includes(s),
                    }))}
                    defaultSelected={season}
                    onChange={setSeason}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Кольори</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c, idx) => (
                      <button
                        type="button"
                        key={`${c.label}-${idx}`}
                        className="relative w-8 h-8 rounded-full border"
                        style={{ backgroundColor: c.hex || "#fff" }}
                        title={c.label}
                        onClick={() =>
                          setColors(colors.filter((_, i) => i !== idx))
                        }
                      >
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Removed dropdown; using swatch list below */}
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c) => (
                      <button
                        type="button"
                        key={`pal-${c.color}`}
                        className="flex items-center gap-2 border rounded-full px-2 py-1 text-xs hover:shadow transition"
                        onClick={() =>
                          setColors((prev) => [
                            ...prev,
                            { label: c.color, hex: c.hex },
                          ])
                        }
                        title={c.color}
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex || "#fff" }}
                        />
                        <span>{c.color}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-10 h-10 p-0 border rounded"
                    />
                    <Input
                      type="text"
                      value={customColorLabel}
                      onChange={(e) => setCustomColorLabel(e.target.value)}
                      placeholder="Назва кольору"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customColorLabel.trim()) return;
                        setColors([
                          ...colors,
                          {
                            label: customColorLabel.trim(),
                            hex: customColorHex,
                          },
                        ]);
                        setCustomColorLabel("");
                        setCustomColorHex("#000000");
                      }}
                      className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
                    >
                      Додати власний
                    </button>
                  </div>
                </div>

                {/* Блок: Склад тканини і Підкладка */}
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <Label>Склад тканини (UA)</Label>
                    <TextArea
                      value={fabricComposition}
                      onChange={setFabricComposition}
                      rows={3}
                      placeholder="Наприклад: 80% бавовна, 20% поліестер"
                    />
                    <button
                      type="button"
                      className="mt-1 text-xs text-blue-600 hover:underline"
                      onClick={() => setShowFabricLocales((v) => !v)}
                    >
                      {showFabricLocales
                        ? "Сховати локалізації складу тканини"
                        : "Додати локалізацію складу тканини"}
                    </button>
                    {showFabricLocales && (
                      <div className="mt-2 space-y-2">
                        <button
                          type="button"
                          className="mb-2 text-xs text-purple-600 hover:underline"
                          disabled={isTranslatingFabric}
                          onClick={async () => {
                            if (!fabricComposition?.trim()) return;
                            try {
                              setIsTranslatingFabric(true);
                              const res = await translateTextAllLangs(
                                fabricComposition,
                                "uk"
                              );
                              setFabricCompositionEn(res.en);
                              setFabricCompositionDe(res.de);
                            } finally {
                              setIsTranslatingFabric(false);
                            }
                          }}
                        >
                          {isTranslatingFabric
                            ? "Переклад складу тканини..."
                            : "Автоматично перекласти склад тканини EN/DE"}
                        </button>
                        <div>
                          <Label>Склад тканини (EN)</Label>
                          <TextArea
                            value={fabricCompositionEn}
                            onChange={setFabricCompositionEn}
                            rows={2}
                            placeholder="Fabric composition in English"
                          />
                        </div>
                        <div>
                          <Label>Склад тканини (DE)</Label>
                          <TextArea
                            value={fabricCompositionDe}
                            onChange={setFabricCompositionDe}
                            rows={2}
                            placeholder="Stoffzusammensetzung auf Deutsch"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Підкладка?</Label>
                    <ToggleSwitch
                      enabled={hasLining}
                      setEnabled={setHasLining}
                      label="Has Lining"
                    />
                  </div>
                </div>
                {/* Lining description input */}
                {hasLining && (
                  <div>
                    <Label>Опис підкладки (UA)</Label>
                    <TextArea
                      value={liningDescription}
                      onChange={setLiningDescription}
                      rows={2}
                      placeholder="Опис підкладки товару"
                    />
                    <button
                      type="button"
                      className="mt-1 text-xs text-blue-600 hover:underline"
                      onClick={() => setShowLiningLocales((v) => !v)}
                    >
                      {showLiningLocales
                        ? "Сховати локалізації підкладки"
                        : "Додати локалізацію підкладки"}
                    </button>
                    {showLiningLocales && (
                      <div className="space-y-2 mt-2">
                        <button
                          type="button"
                          className="mb-2 text-xs text-purple-600 hover:underline"
                          disabled={isTranslatingLining}
                          onClick={async () => {
                            if (!liningDescription?.trim()) return;
                            try {
                              setIsTranslatingLining(true);
                              const res = await translateTextAllLangs(
                                liningDescription,
                                "uk"
                              );
                              setLiningDescriptionEn(res.en);
                              setLiningDescriptionDe(res.de);
                            } finally {
                              setIsTranslatingLining(false);
                            }
                          }}
                        >
                          {isTranslatingLining
                            ? "Переклад підкладки..."
                            : "Автоматично перекласти підкладку EN/DE"}
                        </button>
                        <div>
                          <Label>Опис підкладки (EN)</Label>
                          <TextArea
                            value={liningDescriptionEn}
                            onChange={setLiningDescriptionEn}
                            rows={2}
                            placeholder="Lining description in English"
                          />
                        </div>
                        <div>
                          <Label>Опис підкладки (DE)</Label>
                          <TextArea
                            value={liningDescriptionDe}
                            onChange={setLiningDescriptionDe}
                            rows={2}
                            placeholder="Futterbeschreibung auf Deutsch"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Label className="mb-0">Топ продаж?</Label>
                  <ToggleSwitch
                    enabled={topSale}
                    setEnabled={setTopSale}
                    label="Top Sale"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Лімітована серія?</Label>
                  <ToggleSwitch
                    enabled={limitedEdition}
                    setEnabled={setLimitedEdition}
                    label="Limited Edition"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Статус на сайті</Label>
                  <div className="flex flex-col gap-1 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availabilityStatus"
                        value="available"
                        checked={availabilityStatus === "available"}
                        onChange={() => setAvailabilityStatus("available")}
                      />
                      <span>В наявності (можна купити)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availabilityStatus"
                        value="sold_out"
                        checked={availabilityStatus === "sold_out"}
                        onChange={() => setAvailabilityStatus("sold_out")}
                      />
                      <span>Товар продано (не можна додати в кошик)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availabilityStatus"
                        value="coming_soon"
                        checked={availabilityStatus === "coming_soon"}
                        onChange={() => setAvailabilityStatus("coming_soon")}
                      />
                      <span>Очікуємо поставку (можна додати в кошик)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Рекомендувати</Label>
                  <Input
                    type="text"
                    value={recommendSearch}
                    onChange={(e) => setRecommendSearch(e.target.value)}
                    placeholder="Пошук товару для рекомендації..."
                  />

                  {recommendedProductIds.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                      {recommendedProductIds.map((id) => {
                        const found = allProducts.find((p) => p.id === id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3 rounded border p-2"
                          >
                            <RecommendProductThumb
                              url={found?.first_media?.url}
                              type={found?.first_media?.type}
                              alt={found?.name ?? `Product ${id}`}
                              boxClassName="h-12 w-12"
                            />
                            <span className="flex-1 text-sm">{found ? found.name : `ID ${id}`}</span>
                            <button
                              type="button"
                              className="rounded border px-2 py-1 text-xs text-red-600"
                              onClick={() =>
                                setRecommendedProductIds((prev) =>
                                  prev.filter((item) => item !== id)
                                )
                              }
                              title="Видалити рекомендацію"
                            >
                              Видалити
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="max-h-56 overflow-y-auto rounded border">
                    {allProducts
                      .filter((product) =>
                        product.name
                          .toLowerCase()
                          .includes(recommendSearch.toLowerCase())
                      )
                      .filter(
                        (product) => !recommendedProductIds.includes(product.id)
                      )
                      .slice(0, 20)
                      .map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="flex w-full items-center gap-3 border-b px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() =>
                            setRecommendedProductIds((prev) => [
                              ...prev,
                              product.id,
                            ])
                          }
                        >
                          <RecommendProductThumb
                            url={product.first_media?.url}
                            type={product.first_media?.type}
                            alt={product.name}
                            boxClassName="h-10 w-10"
                          />
                          <span>{product.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Right side: images and videos */}
          <div className="p-4">
            <DropzoneComponent onDrop={handleDrop} />
            {/* {images.length > 0 &&
              images.map((file, i) => {
                const previewUrl = URL.createObjectURL(file);
                const isVideo = file.type.startsWith("video/");
                return (
                  <div key={`new-${i}`} className="relative inline-block mt-4">
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px]"
                        onLoadedData={() => URL.revokeObjectURL(previewUrl)}
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="rounded max-w-[200px] max-h-[200px]"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteNewImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                );
              })} */}

            {mediaFiles.length > 0 &&
              mediaFiles.map((media, i) => {
                const previewUrl = URL.createObjectURL(media.file);
                const isVideo = media.type === "video";
                
                console.log('[Preview] File:', media.file.name, 'Type:', media.type, 'Is video:', isVideo, 'MIME:', media.file.type);

                return (
                  <div
                    key={`media-${i}`}
                    className="relative inline-block mt-4 mx-2"
                  >
                    <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded">
                      #{i + 1}
                    </span>

                    {isVideo ? (
                      <video
                        src={previewUrl}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px] object-cover"
                        onLoadedData={() => {
                          console.log('[Preview] Video loaded');
                          URL.revokeObjectURL(previewUrl);
                        }}
                        onError={(e) => {
                          console.error('[Preview] Video error:', e);
                        }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={media.file.name}
                        width={200}
                        height={200}
                        className="rounded max-w-[200px] max-h-[200px] object-cover"
                        onLoad={() => {
                          console.log('[Preview] Image loaded');
                          URL.revokeObjectURL(previewUrl);
                        }}
                      />
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setMediaFiles((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>

                    {/* Reorder Buttons */}
                    <div className="flex justify-center gap-1 mt-2">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() =>
                          setMediaFiles((prev) => {
                            const newArr = [...prev];
                            [newArr[i - 1], newArr[i]] = [
                              newArr[i],
                              newArr[i - 1],
                            ];
                            return newArr;
                          })
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === mediaFiles.length - 1}
                        onClick={() =>
                          setMediaFiles((prev) => {
                            const newArr = [...prev];
                            [newArr[i], newArr[i + 1]] = [
                              newArr[i + 1],
                              newArr[i],
                            ];
                            return newArr;
                          })
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-lg text-sm disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Збереження..." : "Створити Товар"}
          </button>
        </div>

        {success && <div className="text-green-600 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
}
