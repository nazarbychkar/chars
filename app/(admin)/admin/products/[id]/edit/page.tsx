"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";

// Dummy options
const multiOptions = [
  { value: "1", text: "XL", selected: false },
  { value: "2", text: "L", selected: false },
  { value: "3", text: "M", selected: false },
  { value: "4", text: "S", selected: false },
  { value: "5", text: "XS", selected: false },
];

export default function EditProductPage() {
  const params = useParams(); // Next.js 13+ route params
  const productId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sizes: [] as string[],
  });

  useEffect(() => {
    // Fetch the product data by ID
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          sizes: data.sizes || [],
        });
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    }

    if (productId) fetchProduct();
  }, [productId]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Send PUT request to update product
    await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    router.push("/admin/products"); // Navigate back to product list
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Редагувати Товар" />
      <div className="flex w-full h-screen">
        <div className="w-1/2 p-4">
          <ComponentCard title="Редагувати дані">
            <Label>Назва Товару</Label>
            <Input
              type="text"
              defaultValue={formData.name}
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
              defaultValue={formData.price}
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
          <DropzoneComponent />
        </div>
      </div>

      <div className="p-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Зберегти Зміни
        </button>
      </div>
    </div>
  );
}
