"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";

const multiOptions = [
  { value: "ONESIZE", text: "ONESIZE", selected: false },
  { value: "XL", text: "XL", selected: false },
  { value: "L", text: "L", selected: false },
  { value: "M", text: "M", selected: false },
  { value: "S", text: "S", selected: false },
  { value: "XS", text: "XS", selected: false },
];

const seasonOptions = [
  { value: "Літо", text: "Літо", selected: false },
  { value: "Весна", text: "Весна", selected: false },
  { value: "Зима", text: "Зима", selected: false },
  { value: "Осінь", text: "Осінь", selected: false },
];

type MediaFile = {
  id?: number; // for existing ones
  file?: File; // for new uploads
  url?: string; // for existing ones
  preview?: string; // for new ones (via URL.createObjectURL)
  type: "photo" | "video";
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    nameDe: "",
    description: "",
    descriptionEn: "",
    descriptionDe: "",
    price: "",
    priceEur: "",
    oldPrice: "",
    discountPercentage: "",
    priority: "0",
    sizes: [] as string[],
    media: [] as { type: string; url: string }[],
    topSale: false,
    limitedEdition: false,
    season: [] as string[],
    color: "",
    categoryId: null as number | null,
    subcategoryId: null as number | null,
    fabricComposition: "",
    fabricCompositionEn: "",
    fabricCompositionDe: "",
    hasLining: false,
    liningDescription: "",
    liningDescriptionEn: "",
    liningDescriptionDe: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<
    { id: number; name: string; category_id: number }[]
  >([]);

  const [availableColors, setAvailableColors] = useState<
    { color: string; hex?: string }[]
  >([]);
  const [customColorLabel, setCustomColorLabel] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [colors, setColors] = useState<{ label: string; hex?: string }[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  const [showNameLocales, setShowNameLocales] = useState(false);
  const [showDescriptionLocales, setShowDescriptionLocales] = useState(false);
  const [showLiningLocales, setShowLiningLocales] = useState(false);
  const [showFabricLocales, setShowFabricLocales] = useState(false);
  const [isTranslatingName, setIsTranslatingName] = useState(false);
  const [isTranslatingDescription, setIsTranslatingDescription] = useState(false);
  const [isTranslatingFabric, setIsTranslatingFabric] = useState(false);
  const [isTranslatingLining, setIsTranslatingLining] = useState(false);

  type AvailabilityStatus = "available" | "sold_out" | "coming_soon";
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("available");

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

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/categories`),
        ]);

        const productData = await productRes.json();
        const categoryData = await categoriesRes.json();
        setMediaFiles(
          productData.media.map((item: { url: string; type: string }) => ({
            type: item.type,
            url: item.url,
          }))
        );

        setFormData({
          name: productData.name,
          nameEn: productData.name_en || "",
          nameDe: productData.name_de || "",
          description: productData.description,
          descriptionEn: productData.description_en || "",
          descriptionDe: productData.description_de || "",
          price: String(productData.price),
          priceEur: productData.price_eur ? String(productData.price_eur) : "",
          oldPrice: String(productData.old_price || ""),
          discountPercentage: String(productData.discount_percentage || ""),
          priority: String(productData.priority || 0),
          sizes: productData.sizes.map((s: { size: string }) => s.size),
          media: productData.media,
          topSale: productData.top_sale,
          limitedEdition: productData.limited_edition,
          season: productData.season,
          color: productData.color,
          categoryId: productData.category_id,
          subcategoryId: productData.subcategory_id || null,
          fabricComposition: productData.fabric_composition || "",
          fabricCompositionEn: productData.fabric_composition_en || "",
          fabricCompositionDe: productData.fabric_composition_de || "",
          hasLining: productData.has_lining || false,
          liningDescription: productData.lining_description || "",
          liningDescriptionEn: productData.lining_description_en || "",
          liningDescriptionDe: productData.lining_description_de || "",
        });

        // Initialize sizeStocks from productData.sizes
        const initialStocks: Record<string, number> = {};
        (productData.sizes || []).forEach(
          (s: { size: string; stock?: number }) => {
            initialStocks[s.size] = typeof s.stock === "number" ? s.stock : 0;
          }
        );
        setSizeStocks(initialStocks);

        setCategoryOptions(categoryData);
        setColors(productData.colors || []);

        setAvailabilityStatus(
          (productData.availability_status as AvailabilityStatus) || "available"
        );
      } catch (err) {
        console.error("Failed to fetch product or categories", err);
        setError("Помилка при завантаженні товару або категорій");
      } finally {
        setLoadingData(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

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
    async function fetchSubcategories() {
      if (!formData.categoryId) {
        setSubcategoryOptions([]); // Clear if no category selected
        return;
      }

      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${formData.categoryId}`
        );
        if (!res.ok) throw new Error("Failed to fetch subcategories");

        const data = await res.json();
        setSubcategoryOptions(data);
      } catch (error) {
        console.error("Error fetching subcategories", error);
      }
    }

    fetchSubcategories();
  }, [formData.categoryId]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  const handleDrop = (files: File[]) => {
    console.log('[EditProduct] handleDrop called with files:', files);
    
    // Add to images state (for new uploads)
    setImages((prev) => [...prev, ...files]);
    
    // Also add to mediaFiles for preview with metadata
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.startsWith("video/")
        ? "video"
        : "photo") as MediaFile["type"],
    }));

    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  // Reorder for existing images
  const moveExistingMedia = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.media];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, media: updated };
    });
  };

  // Reorder for new images
  const moveNewImage = (fromIndex: number, toIndex: number) => {
    console.log('[EditProduct] Moving new image from', fromIndex, 'to', toIndex);
    
    // Get only new files (with file property)
    const newMediaFiles = mediaFiles.filter((m) => m.file);
    const existingMedia = mediaFiles.filter((m) => !m.file);
    
    const updated = [...newMediaFiles];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    
    setMediaFiles([...existingMedia, ...updated]);
    
    // Also update images state
    setImages(updated.map((m) => m.file!));
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleDeleteNewImage = (indexToRemove: number) => {
    console.log('[EditProduct] Deleting new image at index:', indexToRemove);
    
    // Get all new media files (those with file property)
    const newMediaFiles = mediaFiles.filter((m) => m.file);
    const itemToDelete = newMediaFiles[indexToRemove];
    
    // Revoke object URL to prevent memory leak
    if (itemToDelete?.preview) {
      URL.revokeObjectURL(itemToDelete.preview);
    }
    
    // Remove from images state
    const newMediaFilesArray = mediaFiles.filter((m) => m.file).map((m) => m.file).filter((f): f is File => !!f);
    const newImages = newMediaFilesArray.filter((_, i) => i !== indexToRemove);
    setImages(newImages);
    
    // Remove from mediaFiles state
    setMediaFiles((prev) => {
      const newFiles = prev.filter((m) => m.file);
      const rest = prev.filter((m) => !m.file);
      const updatedNewFiles = newFiles.filter((_, i) => i !== indexToRemove);
      return [...rest, ...updatedNewFiles];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      console.log('[EditProduct] Submitting form. Images to upload:', images.length);
      
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];

      if (images.length > 0) {
        console.log('[EditProduct] Uploading new images:', images.map(f => f.name));
        
        const totalSize = images.reduce((sum, img) => sum + img.size, 0);
        const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total
        const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB per file

        // Check individual file sizes
        for (const img of images) {
          if (img.size > MAX_FILE_SIZE) {
            throw new Error(
              `Файл "${img.name}" занадто великий. Максимальний розмір одного файлу: 15MB.`
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
        images.forEach((img) => uploadForm.append("images", img));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ error: "Помилка завантаження файлів" }));
          throw new Error(errorData.error || "Помилка завантаження файлів");
        }

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media;
        
        console.log('[EditProduct] Uploaded media:', uploadedMedia);
      }

      const updatedMedia = [...formData.media, ...uploadedMedia];

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          name_en: formData.nameEn || null,
          name_de: formData.nameDe || null,
          description: formData.description,
          description_en: formData.descriptionEn || null,
          description_de: formData.descriptionDe || null,
          price: Number(formData.price),
          price_eur: formData.priceEur ? Number(formData.priceEur) : null,
          old_price: formData.oldPrice ? Number(formData.oldPrice) : null,
          discount_percentage: formData.discountPercentage
            ? Number(formData.discountPercentage)
            : null,
          priority: Number(formData.priority),
          sizes: formData.sizes.map((s) => ({ size: s, stock: sizeStocks[s] ?? 0 })),
          media: updatedMedia,
          top_sale: formData.topSale,
          limited_edition: formData.limitedEdition,
          season: formData.season,
          color: formData.color,
          colors,
          category_id: formData.categoryId,
          subcategory_id: formData.subcategoryId,
          fabric_composition: formData.fabricComposition,
          fabric_composition_en: formData.fabricCompositionEn || null,
          fabric_composition_de: formData.fabricCompositionDe || null,
          has_lining: formData.hasLining,
          lining_description: formData.liningDescription,
          lining_description_en: formData.liningDescriptionEn || null,
          lining_description_de: formData.liningDescriptionDe || null,
          availability_status: availabilityStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      setSuccess("Товар успішно оновлено");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити товар");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження даних...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Товар" />
          <div className="flex w-full h-auto flex-col lg:flex-row">
            <div className="w-full p-4 lg:w-1/2">
              <ComponentCard title="Редагувати дані">
                {/* Назва товару + локалізації */}
                <Label>Назва товару (UA)</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <button
                  type="button"
                  className="mt-2 mb-4 text-xs text-blue-600 hover:underline"
                  onClick={() => setShowNameLocales((v) => !v)}
                >
                  {showNameLocales ? "Сховати локалізації назви" : "Додати локалізацію назви"}
                </button>
                {showNameLocales && (
                  <button
                    type="button"
                    className="mb-4 text-xs text-purple-600 hover:underline"
                    disabled={isTranslatingName}
                    onClick={async () => {
                      if (!formData.name?.trim()) return;
                      try {
                        setIsTranslatingName(true);
                        const res = await translateTextAllLangs(
                          formData.name,
                          "uk"
                        );
                        handleChange("nameEn", res.en);
                        handleChange("nameDe", res.de);
                      } finally {
                        setIsTranslatingName(false);
                      }
                    }}
                  >
                    {isTranslatingName
                      ? "Переклад назви..."
                      : "Автоматично перекласти назву EN/DE"}
                  </button>
                )}
                {showNameLocales && (
                  <div className="mb-4 space-y-2">
                    <div>
                      <Label>Назва (EN)</Label>
                      <Input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => handleChange("nameEn", e.target.value)}
                        placeholder="Product name in English"
                      />
                    </div>
                    <div>
                      <Label>Назва (DE)</Label>
                      <Input
                        type="text"
                        value={formData.nameDe}
                        onChange={(e) => handleChange("nameDe", e.target.value)}
                        placeholder="Produktname auf Deutsch"
                      />
                    </div>
                  </div>
                )}

                {/* Опис + локалізації */}
                <Label>Опис (UA)</Label>
                <TextArea
                  value={formData.description}
                  onChange={(value) => handleChange("description", value)}
                  rows={6}
                />
                <button
                  type="button"
                  className="mt-2 mb-4 text-xs text-blue-600 hover:underline"
                  onClick={() => setShowDescriptionLocales((v) => !v)}
                >
                  {showDescriptionLocales
                    ? "Сховати локалізації опису"
                    : "Додати локалізацію опису"}
                </button>
                {showDescriptionLocales && (
                  <div className="mb-4 space-y-2">
                    <button
                      type="button"
                      className="mb-2 text-xs text-purple-600 hover:underline"
                      disabled={isTranslatingDescription}
                      onClick={async () => {
                        if (!formData.description?.trim()) return;
                        try {
                          setIsTranslatingDescription(true);
                          const res = await translateTextAllLangs(
                            formData.description,
                            "uk"
                          );
                          handleChange("descriptionEn", res.en);
                          handleChange("descriptionDe", res.de);
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
                        value={formData.descriptionEn}
                        onChange={(value) =>
                          handleChange("descriptionEn", value)
                        }
                        rows={4}
                        placeholder="Product description in English"
                      />
                    </div>
                    <div>
                      <Label>Опис (DE)</Label>
                      <TextArea
                        value={formData.descriptionDe}
                        onChange={(value) =>
                          handleChange("descriptionDe", value)
                        }
                        rows={4}
                        placeholder="Produktbeschreibung auf Deutsch"
                      />
                    </div>
                  </div>
                )}

                {/* Ціни: два стовпчики UAH / EUR */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* UAH column */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Ціни в гривнях (UAH)
                    </h3>
                    <div>
                      <Label>Нова ціна, ₴</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder="Поточна ціна в гривнях"
                      />
                    </div>
                    <div>
                      <Label>Стара ціна, ₴ (опціонально)</Label>
                      <Input
                        type="number"
                        value={formData.oldPrice}
                        onChange={(e) =>
                          handleChange("oldPrice", e.target.value)
                        }
                        placeholder="Ціна до знижки в гривнях"
                      />
                    </div>
                    <div>
                      <Label>Відсоток знижки, %</Label>
                      <Input
                        type="number"
                        value={formData.discountPercentage}
                        onChange={(e) =>
                          handleChange("discountPercentage", e.target.value)
                        }
                        placeholder="Наприклад: 20"
                      />
                    </div>
                  </div>

                  {/* EUR column */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Ціни в євро (EN / DE)
                    </h3>
                    <div>
                      <Label>Нова ціна, €</Label>
                      <Input
                        type="number"
                        value={formData.priceEur}
                        onChange={(e) =>
                          handleChange("priceEur", e.target.value)
                        }
                        placeholder="Поточна ціна в євро"
                      />
                    </div>
                    {/* Виводимо знижку та «стару» в EUR як інформацію */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Знижка:{" "}
                        {formData.discountPercentage
                          ? `${formData.discountPercentage}%`
                          : "0%"}
                      </p>
                      {formData.priceEur &&
                        formData.discountPercentage &&
                        Number(formData.discountPercentage) > 0 && (
                          <p>
                            Стара ціна, € (розрахована):{" "}
                            {(
                              Number(formData.priceEur) /
                              (1 - Number(formData.discountPercentage) / 100)
                            ).toFixed(2)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <Label>Пріоритет показу</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  placeholder="0 - звичайний, 1 - високий"
                />

                <Label>Розміри</Label>
                <MultiSelect
                  label="Розміри"
                  options={multiOptions}
                  defaultSelected={formData.sizes}
                  onChange={(values: string[]) => {
                    // Update selected sizes
                    handleChange("sizes", values);
                    // Ensure stocks exist for any newly added size
                    setSizeStocks((prev) => {
                      const next = { ...prev };
                      values.forEach((sz: string) => {
                        if (next[sz] === undefined) next[sz] = 0;
                      });
                      // Remove stocks for sizes no longer selected
                      Object.keys(next).forEach((sz) => {
                        if (!values.includes(sz)) delete (next as Record<string, number>)[sz];
                      });
                      return next;
                    });
                  }}
                />

                {/* Per-size stock editor */}
                {formData.sizes?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label>Кількість по розмірах</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {formData.sizes.map((sz) => (
                        <div key={sz} className="flex items-center gap-2 border rounded px-2 py-1">
                          <span className="min-w-10 text-sm font-medium">{sz}</span>
                          <input
                            type="number"
                            min={0}
                            value={sizeStocks[sz] ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value) || 0);
                              setSizeStocks((prev) => ({ ...prev, [sz]: val }));
                            }}
                            className="w-20 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Label>Категорія</Label>
                <select
                  value={formData.categoryId ?? ""}
                  onChange={(e) => {
                    const selectedCategoryId = Number(e.target.value);
                    handleChange("categoryId", selectedCategoryId);
                    handleChange("subcategoryId", null); // ✅ Reset subcategory
                  }}
                  className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Виберіть категорію</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {formData.categoryId && (
                  <>
                    <Label>Підкатегорія</Label>
                    <select
                      value={formData.subcategoryId ?? ""}
                      onChange={(e) =>
                        handleChange("subcategoryId", Number(e.target.value))
                      }
                      className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Виберіть підкатегорію</option>
                      {subcategoryOptions
                        .filter(
                          (sub) => sub.category_id === formData.categoryId
                        )
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </>
                )}

                <Label>Cезон</Label>
                <MultiSelect
                  label="Сезон"
                  options={seasonOptions}
                  defaultSelected={formData.season}
                  onChange={(values) => handleChange("season", values)}
                />

                <div className="space-y-2">
                  <Label>Кольори</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs"
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex || "#fff" }}
                        />
                        {c.label}
                        <button
                          type="button"
                          className="ml-1 text-red-600"
                          onClick={() =>
                            setColors(colors.filter((_, i) => i !== idx))
                          }
                        >
                          ×
                        </button>
                      </span>
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
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50 mt-4">
                  <div>
                    <Label>Склад тканини (UA)</Label>
                    <TextArea
                      value={formData.fabricComposition}
                      onChange={(value) =>
                        handleChange("fabricComposition", value)
                      }
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
                            if (!formData.fabricComposition?.trim()) return;
                            try {
                              setIsTranslatingFabric(true);
                              const res = await translateTextAllLangs(
                                formData.fabricComposition,
                                "uk"
                              );
                              handleChange("fabricCompositionEn", res.en);
                              handleChange("fabricCompositionDe", res.de);
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
                            value={formData.fabricCompositionEn}
                            onChange={(value) =>
                              handleChange("fabricCompositionEn", value)
                            }
                            rows={2}
                            placeholder="Fabric composition in English"
                          />
                        </div>
                        <div>
                          <Label>Склад тканини (DE)</Label>
                          <TextArea
                            value={formData.fabricCompositionDe}
                            onChange={(value) =>
                              handleChange("fabricCompositionDe", value)
                            }
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
                      enabled={formData.hasLining}
                      setEnabled={(value) => handleChange("hasLining", value)}
                      label="Has Lining"
                    />
                  </div>
                  {formData.hasLining && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <Label>Опис підкладки (UA)</Label>
                        <TextArea
                          value={formData.liningDescription}
                          onChange={(value) =>
                            handleChange("liningDescription", value)
                          }
                          rows={2}
                          placeholder="Опис підкладки товару"
                        />
                      </div>
                      <button
                        type="button"
                        className="mt-1 text-xs text-blue-600 hover:underline"
                        onClick={() =>
                          setShowLiningLocales((v) => !v)
                        }
                      >
                        {showLiningLocales
                          ? "Сховати локалізації підкладки"
                          : "Додати локалізацію підкладки"}
                      </button>
                      {showLiningLocales && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            className="mb-2 text-xs text-purple-600 hover:underline"
                            disabled={isTranslatingLining}
                            onClick={async () => {
                              if (!formData.liningDescription?.trim()) return;
                              try {
                                setIsTranslatingLining(true);
                                const res = await translateTextAllLangs(
                                  formData.liningDescription,
                                  "uk"
                                );
                                handleChange("liningDescriptionEn", res.en);
                                handleChange("liningDescriptionDe", res.de);
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
                              value={formData.liningDescriptionEn}
                              onChange={(value) =>
                                handleChange("liningDescriptionEn", value)
                              }
                              rows={2}
                              placeholder="Lining description in English"
                            />
                          </div>
                          <div>
                            <Label>Опис підкладки (DE)</Label>
                            <TextArea
                              value={formData.liningDescriptionDe}
                              onChange={(value) =>
                                handleChange("liningDescriptionDe", value)
                              }
                              rows={2}
                              placeholder="Futterbeschreibung auf Deutsch"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label className="mb-0">Топ продаж?</Label>
                  <ToggleSwitch
                    enabled={formData.topSale}
                    setEnabled={(value) => handleChange("topSale", value)}
                    label="Top Sale"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label className="mb-0">Лімітована серія?</Label>
                  <ToggleSwitch
                    enabled={formData.limitedEdition}
                    setEnabled={(value) =>
                      handleChange("limitedEdition", value)
                    }
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
              </ComponentCard>
            </div>

            <div className="w-full p-4 lg:w-1/2">
              <DropzoneComponent onDrop={handleDrop} />
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {formData.media.map((item, i) => (
                  <div key={`existing-${i}`} className="relative inline-block">
                    {item.type === "video" ? (
                      <video
                        src={`/api/images/${item.url}`}
                        controls
                        className="w-32 h-32 object-cover rounded"
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt={`media-${i}`}
                        width={128}
                        height={128}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="absolute top-1 left-1 flex gap-1">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveExistingMedia(i, i - 1)}
                          className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="←"
                        >
                          ←
                        </button>
                      )}
                      {i < formData.media.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveExistingMedia(i, i + 1)}
                          className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="→"
                        >
                          →
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {mediaFiles
                  .filter((m) => m.file) // Only show new files (with file property)
                  .map((media, i) => {
                    console.log('[EditProduct] Rendering new media preview:', media);
                    const previewUrl = media.preview || URL.createObjectURL(media.file!);
                    const isVideo = media.type === "video";
                    return (
                      <div key={`new-${i}`} className="relative inline-block">
                        {isVideo ? (
                          <video
                            src={previewUrl}
                            controls
                            className="w-32 h-32 object-cover rounded"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewUrl}
                            alt={`new-media-${i}`}
                            width={128}
                            height={128}
                            className="rounded object-cover"
                          />
                        )}
                      <div className="absolute top-1 left-1 flex gap-1">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveNewImage(i, i - 1)}
                            className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="←"
                          >
                            ←
                          </button>
                        )}
                        {i < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveNewImage(i, i + 1)}
                            className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="→"
                          >
                            →
                          </button>
                        )}
                      </div>

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
                })}
              </div>
            </div>
          </div>

          <div className="p-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти Зміни"}
            </button>

            {success && (
              <div className="text-green-600 text-center mt-2">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-2">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
