"use client";

import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import React, { useState } from "react";

const statusOptions = [
  { value: "pending", text: "Очікується" },
  { value: "delivering", text: "Доставляється" },
  { value: "fulfilled", text: "Виконано" },
];

export default function CreateOrderForm() {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [city, setCity] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [status, setStatus] = useState("pending");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("customer_name", customerName);
      formData.append("phone_number", phoneNumber);
      formData.append("email", email);
      formData.append("delivery_method", deliveryMethod);
      formData.append("city", city);
      formData.append("post_office", postOffice);
      formData.append("status", status);

      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Не вдалося створити замовлення");

      setSuccess("Замовлення успішно створено!");
      setCustomerName("");
      setPhoneNumber("");
      setEmail("");
      setDeliveryMethod("");
      setCity("");
      setPostOffice("");
      setStatus("pending");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Помилка під час створення замовлення");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Створити Замовлення" />
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row justify-around">
          <div className="w-full md:w-1/2 p-4">
            <ComponentCard title="Інформація про замовлення">
              <Label>Ім&#39;я клієнта</Label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <Label>Номер телефону</Label>
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Label>Метод доставки</Label>
              <Input
                type="text"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />

              <Label>Місто</Label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Label>Відділення Пошти</Label>
              <Input
                type="text"
                value={postOffice}
                onChange={(e) => setPostOffice(e.target.value)}
              />

              <Label>Статус</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            </ComponentCard>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Створити Замовлення"}
            </button>
          </div>
        </div>
        {success && (
          <div className="text-green-600 text-center mt-2">{success}</div>
        )}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
}
