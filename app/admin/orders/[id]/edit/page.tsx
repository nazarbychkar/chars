"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import Select from "@/components/admin/form/Select";

export default function EditOrderPage() {
  const params = useParams();
  const orderId = params?.id;
  const router = useRouter();

  const options = [
    { value: "pending", label: "Очікується" },
    { value: "delivering", label: "Доставляємо" },
    { value: "complete", label: "Завершено" },
  ];

  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    delivery_method: "",
    city: "",
    post_office: "",
    status: "",
    payment_type: "",
    currency: "UAH",
    locale: "",
    items: [],
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
          payment_type: data.payment_type || "",
          currency: data.currency === "EUR" ? "EUR" : "UAH",
          locale: data.locale || "",
          items: data.items || [],
        });
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    }

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleChange = (field: string, value: string) => {
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

  const calculateTotal = () => {
    return formData.items
      .reduce(
        (
          total,
          item: {
            product_id: number;
            size: string;
            quantity: number;
            price: string;
          }
        ) => {
          const subtotal = parseFloat(item.price) * item.quantity;
          return total + subtotal;
        },
        0
      )
      .toFixed(2);
  };

  const calculateRemainingPayment = () => {
    const total = parseFloat(calculateTotal());
    if (formData.payment_type === "full") {
      return "0.00";
    } else if (formData.payment_type === "prepay") {
      return Math.max(0, total - 300).toFixed(2);
    }
    return total.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Редагувати Замовлення" />

      {/* Customer Info */}
          <div className="px-4">
        <ComponentCard title="Інформація про замовлення">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ім&#39;я клієнта</Label>
              <Input
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Номер телефону</Label>
              <Input
                type="phone"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Метод доставки</Label>
              <Input
                type="text"
                value={formData.delivery_method}
                onChange={(e) =>
                  handleChange("delivery_method", e.target.value)
                }
                disabled
              />
            </div>
            <div>
              <Label>Місто</Label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Відділення Нової Пошти</Label>
              <Input
                type="text"
                value={formData.post_office}
                onChange={(e) => handleChange("post_office", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Мова сайту</Label>
              <Input
                type="text"
                value={formData.locale || ""}
                disabled
              />
            </div>
            <div>
              <Label>Валюта замовлення</Label>
              <Input
                type="text"
                value={formData.currency === "EUR" ? "€ EUR" : "₴ UAH"}
                disabled
              />
            </div>
            <div>
              <Label>Спосіб оплати</Label>
              <Input
                type="text"
                value={
                  formData.payment_type === "full"
                    ? "Повна оплата"
                    : formData.payment_type === "prepay"
                    ? "Передоплата 300 ₴"
                    : formData.payment_type === "paypal_full"
                    ? "Повна оплата через PayPal"
                    : "Не вказано"
                }
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <Label>Статус</Label>
              <div className="relative">
                <Select
                  options={options}
                  placeholder="Select Option"
                  value={formData.status}
                  onChange={(value: string) => handleChange("status", value)}
                  className="dark:bg-dark-900"
                />
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Order Items Table */}
      <div className="px-4">
        <ComponentCard title="Товари у замовленні">
          {formData.items.length === 0 ? (
            <p className="text-gray-500">Немає товарів у цьому замовленні.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Назва продукту
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Розмір
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Колір
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Кількість
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Ціна ({formData.currency === "EUR" ? "€" : "₴"})
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Сума ({formData.currency === "EUR" ? "€" : "₴"})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {formData.items.map(
                    (item: {
                      id: number;
                      product_name: string;
                      color?: string | null;
                      size: string;
                      quantity: number;
                      price: string;
                    }) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {item.size}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {item.color || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                    >
                      Загальна сума:
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">
                      {calculateTotal()} ₴
                    </td>
                  </tr>
                  {formData.payment_type && (
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                      >
                        Залишок до оплати:
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {calculateRemainingPayment()} ₴
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-10">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200"
          onClick={handleSubmit}
        >
          💾 Зберегти Зміни
        </button>
      </div>
    </div>
  );
}
