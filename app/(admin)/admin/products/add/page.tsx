"use client";

import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import React, { useState } from "react";

const multiOptions = [
  { value: "1", text: "XL", selected: false },
  { value: "2", text: "L", selected: false },
  { value: "3", text: "M", selected: false },
  { value: "4", text: "S", selected: false },
  { value: "5", text: "XS", selected: false },
];

export default function FormElements() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState<string[]>(["1", "3"]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Example Dropzone handler (adapt to your DropzoneComponent)
  const handleDrop = (files: File[]) => {
    setImage(files[0]);
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
      formData.append("sizes", JSON.stringify(sizes));
      if (image) formData.append("image", image);

      // Replace with your API endpoint
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create product");

      setSuccess("Product created successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setSizes([]);
      setImage(null);
    } catch (err: any) {
      setError(err.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };

  // TODO: i finished here
  return (
    <div>
      <PageBreadcrumb pageTitle="Додати Товар" />
      <form onSubmit={handleSubmit}>
        <div className="flex justify-around">
          <div className="w-1/2 p-4">
            <ComponentCard title="Заповніть дані">
              <Label>Назва Товару</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Label>Опис</Label>
              <TextArea
                value={description}
                onChange={setDescription}
                rows={6}
              />
              <Label>Ціна</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Label>Розміри</Label>
              <MultiSelect
                label="Multiple Select Options"
                options={multiOptions}
                defaultSelected={sizes}
                onChange={setSizes}
              />
            </ComponentCard>
          </div>
          <div className="w-1/2 p-4">
            <Label>Зображення</Label>
            <DropzoneComponent onDrop={handleDrop} />
            {image && <div className="mt-2 text-sm">{image.name}</div>}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Збереження..." : "Створити Товар"}
          </button>
        </div>
        {success && (
          <div className="text-green-600 text-center mt-2">{success}</div>
        )}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
}
