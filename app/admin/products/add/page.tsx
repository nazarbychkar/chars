"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";
import Image from "next/image";

const seasonOptions = ["Весна", "Літо", "Осінь", "Зима"];

const multiOptions = [
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

export default function FormElements() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const [topSale, setTopSale] = useState(false);
  const [limitedEdition, setLimitedEdition] = useState(false);

  const [color, setColor] = useState("");
  const [availableColors, setAvailableColors] = useState<{ color: string }[]>(
    []
  );

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [season, setSeason] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleDrop = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleDeleteNewImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("color", color);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("top_sale", String(topSale));
      formData.append("limited_edition", String(limitedEdition));
      formData.append("season", season);
      if (categoryId !== null) {
        formData.append("category_id", categoryId.toString());
      }
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || "Failed to create product");
      }

      setSuccess("Товар успішно створено!");
      setName("");
      setDescription("");
      setPrice("");
      setColor("");
      setSizes([]);
      setImages([]);
      setTopSale(false);
      setLimitedEdition(false);
      setSeason("");
      setCategoryId(null);
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
                <div>
                  <Label>Назва Товару</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Опис</Label>
                  <TextArea
                    value={description}
                    onChange={setDescription}
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Ціна</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <MultiSelect
                    label="Розміри"
                    options={multiOptions}
                    defaultSelected={sizes}
                    onChange={setSizes}
                  />
                </div>
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
                <div>
                  <Label>Сезон</Label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Виберіть сезон</option>
                    {seasonOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="color">Колір</Label>
                  <Input
                    id="color"
                    list="color-options"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <datalist id="color-options">
                    {availableColors.map((c) => (
                      <option key={c.color} value={c.color} />
                    ))}
                  </datalist>
                </div>
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
              </div>
            </ComponentCard>
          </div>

          {/* Right side: images */}
          <div className="p-4">
            <DropzoneComponent onDrop={handleDrop} />
            {images.length > 0 &&
              images.map((file, i) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div key={`new-${i}`} className="relative inline-block">
                    <Image
                      src={previewUrl}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="rounded max-w-[200px] max-h-[200px]"
                      onLoad={() => URL.revokeObjectURL(previewUrl)}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteNewImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити зображення"
                    >
                      ✕
                    </button>
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
