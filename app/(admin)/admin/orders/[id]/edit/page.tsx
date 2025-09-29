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
  { value: "1", text: "pending", selected: false },
  { value: "2", text: "delivering", selected: false },
  { value: "3", text: "fulfilled", selected: false },
];

export default function EditOrderPage() {
  const params = useParams(); // Next.js 13+ route params
  const orderId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    delivery_method: "",
    city: "",
    post_office: "",
    status: "",
  });

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        setFormData({
          customer_name: data.customer_name || "",
          phone_number: data.phone_number || "",
          email: data.email || "",
          delivery_method: data.delivery_method || "",
          city: data.city || "",
          post_office: data.post_office || "",
          status: data.status || "",
        });
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    }

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    router.push("/admin/orders");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Редагувати Замовлення" />
      <div className="flex w-full flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-4">
          <ComponentCard title="Редагувати дані">
            <Label>Ім'я клієнта</Label>
            <Input
              type="text"
              value={formData.customer_name}
              onChange={(e) => handleChange("customer_name", e.target.value)}
            />

            <Label>Номер телефону</Label>
            <Input
              type="text"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />

            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Label>Метод доставки</Label>
            <Input
              type="text"
              value={formData.delivery_method}
              onChange={(e) => handleChange("delivery_method", e.target.value)}
            />

            <Label>Місто</Label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />

            <Label>Відділення Нової Пошти</Label>
            <Input
              type="text"
              value={formData.post_office}
              onChange={(e) => handleChange("post_office", e.target.value)}
            />

            <Label>Статус</Label>
            <Input
              type="text"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            />
          </ComponentCard>
        </div>

        <div className="w-full md:w-1/2 p-4">
          <ComponentCard title="Файли">
            <DropzoneComponent />
          </ComponentCard>
        </div>
      </div>

      <div className="p-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Зберегти Зміни
        </button>
      </div>
    </div>
  );
}
