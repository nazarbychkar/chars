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

const multiOptions = [
  { value: "1", text: "XL", selected: false },
  { value: "2", text: "L", selected: false },
  { value: "3", text: "M", selected: false },
  { value: "4", text: "S", selected: false },
  { value: "5", text: "XS", selected: false },
];

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sizes: [] as string[],
    media: [] as { type: string; url: string }[],
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        setFormData({
          name: data.name,
          description: data.description,
          price: String(data.price),
          sizes: data.sizes.map((s: { size: string }) => s.size),
          media: data.media, // Keep as array of { type, url }
        });
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Failed to load product data");
      }
    }

    if (productId) fetchProduct();
  }, [productId]);

  const handleDrop = (files: File[]) => {
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Delete existing image from media array
  const handleDeleteImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indexToRemove),
    }));
  };

  // Delete new uploaded image from images array
  const handleDeleteNewImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // TODO: Upload new images and get their URLs here
      // For example:
      // const uploadedUrls = await uploadImages(images);

      // For now, just pretend uploadedUrls are dummy URLs
      const uploadedUrls = images.map(() => "/images/hero-bg.png");

      const updatedMedia = [
        ...formData.media, // existing images
        ...uploadedUrls.map((url) => ({ type: "photo", url })),
      ];

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          sizes: formData.sizes,
          media: updatedMedia,
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
    <form onSubmit={handleSubmit}>
      <PageBreadcrumb pageTitle="Редагувати Товар" />
      <div className="flex w-full h-auto">
        <div className="w-1/2 p-4">
          <ComponentCard title="Редагувати дані">
            <Label>Назва Товару</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <Label>Опис</Label>
            <TextArea
              value={formData.description}
              onChange={(value) => handleChange("description", value)}
              rows={6}
            />

            <Label>Ціна</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />

            <Label>Розміри</Label>
            <MultiSelect
              label="Розміри"
              options={multiOptions}
              defaultSelected={formData.sizes}
              onChange={(values) => handleChange("sizes", values)}
            />
          </ComponentCard>
        </div>

        <div className="w-1/2 p-4">
          <Label>Зображення</Label>
          <DropzoneComponent onDrop={handleDrop} />
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            {/* Existing images */}
            {formData.media.map((item, i) => (
              <div key={`existing-${i}`} className="relative inline-block">
                <Image
                  src={item.url}
                  width={200}
                  height={200}
                  alt={`image-${i}`}
                  className="rounded"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="Видалити зображення"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* New uploaded images previews */}
            {images.map((file, i) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div key={`new-${i}`} className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="rounded max-w-[200px] max-h-[200px]"
                    onLoad={() => URL.revokeObjectURL(previewUrl)} // free memory
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
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
    </form>
  );
}
