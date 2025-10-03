"use client";
// TODO: edit final card when order is pushed
import { useState } from "react";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";

export default function FinalCard() {
  const { isDark } = useAppContext();
  const { items, updateQuantity, removeItem } = useBasket();

  // State for form fields
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // const [comment, setComment] = useState("");

  // For required delivery fields - adjust as needed
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // example default
  const [city, setCity] = useState("");
  const [postOffice, setPostOffice] = useState("");

  // Optional: Loading / error / success states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (
      !customerName ||
      !phoneNumber ||
      !deliveryMethod ||
      !city ||
      !postOffice
    ) {
      setError("Будь ласка, заповніть усі обов’язкові поля.");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Ваш кошик порожній.");
      setLoading(false);
      return;
    }

    // Prepare items for API (mapping to product_id etc.)
    const apiItems = items.map((item) => ({
      product_id: item.id,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          phone_number: phoneNumber,
          email: email || null,
          delivery_method: deliveryMethod,
          city,
          post_office: postOffice,
          items: apiItems,
          // comment, // if your API supports comment, add it
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Помилка при оформленні замовлення.");
      } else {
        const data = await response.json();
        setSuccess(`Замовлення успішно створено! Номер: ${data.orderId}`);
        // Optionally clear basket and form here
      }
    } catch (err) {
      setError("Помилка мережі. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1922px] w-full mx-auto relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
        <div className="mt-10 text-center sm:text-left text-3xl sm:text-6xl font-normal font-['Inter'] leading-snug sm:leading-[64.93px] mb-5">
          Заповніть всі поля
        </div>

        <div className="w-full sm:w-1/4"></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full sm:w-1/3"
          noValidate
        >
          <label
            htmlFor="name"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Ім’я *
          </label>
          <input
            type="text"
            id="name"
            placeholder="Ваше імʼя"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <label
            htmlFor="email"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Ваш Email"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label
            htmlFor="phone"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Телефон *
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="Ваш телефон"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />

          {/* Add delivery method, city, and post office fields */}
          <label
            htmlFor="deliveryMethod"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Спосіб доставки *
          </label>
          <select
            id="deliveryMethod"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            required
          >
            <option value="">Оберіть спосіб доставки</option>
            <option value="nova_poshta">Нова Пошта</option>
            <option value="ukrposhta">Укрпошта</option>
          </select>

          <label
            htmlFor="city"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Місто *
          </label>
          <input
            type="text"
            id="city"
            placeholder="Ваше місто"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />

          <label
            htmlFor="postOffice"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Відділення пошти *
          </label>
          <input
            type="text"
            id="postOffice"
            placeholder="Номер відділення"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={postOffice}
            onChange={(e) => setPostOffice(e.target.value)}
            required
          />
          {/* TODO: add comment later */}
          {/* <label
            htmlFor="comment"
            className="text-xl sm:text-2xl font-normal font-['Arial']"
          >
            Коментар
          </label>
          <input
            type="text"
            id="comment"
            placeholder="Ваш коментар"
            className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          /> */}

          <button
            className={`${
              isDark ? "bg-white text-black" : "bg-black text-white"
            } p-4 sm:p-5 rounded mt-3 font-semibold`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Відправка..." : "Відправити"}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </form>

        <div className="flex flex-col gap-4 w-1/4">
          {items.length === 0 ? (
            <p>Ваш кошик порожній</p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="w-full rounded p-4 flex flex-col sm:flex-row gap-4 sm:gap-3 items-center"
              >
                <img
                  className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded"
                  src={item.imageUrl}
                  alt={item.name}
                />
                <div className="flex flex-col flex-1 gap-1">
                  <div className="text-base font-normal font-['Inter'] leading-normal">
                    {item.name}
                  </div>
                  <div className="text-zinc-600 text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                    {item.price} ₴
                  </div>
                  <div className="text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                    {item.size}
                  </div>

                  <div className="flex justify-start items-center gap-3 mt-auto">
                    <div className="w-20 h-9 border border-neutral-400/60 flex justify-around items-center rounded">
                      <button
                        className="text-zinc-500 text-base font-normal font-['Inter'] leading-normal"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <div className="text-base font-normal font-['Inter'] leading-normal">
                        {item.quantity}
                      </div>
                      <button
                        className="text-zinc-500 text-base font-normal font-['Inter'] leading-normal"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                    </div>
                    <button
                      className="text-red-500 font-semibold"
                      onClick={() => removeItem(item.id, item.size)}
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Total price container */}
          <div className="p-5 border-t flex justify-between text-base sm:text-2xl font-normal font-['Arial'] mt-4">
            <div>Всього</div>
            <div className="font-['Helvetica'] leading-relaxed tracking-wide">
              {items
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}{" "}
              ₴
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
