"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Mousewheel } from "swiper/modules";
import "swiper/css/scrollbar";

// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   created_at: Date;
//   sizes: { size: string }[];
//   top_sale?: boolean;
//   limited_edition?: boolean;
//   season?: string;
//   category_name?: string;
// }

export default function FinalCard() {
  // GENERAL
  const { isDark } = useAppContext();
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();

  // CUSTOMER
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("nova_poshta_branch");
  const [city, setCity] = useState("");
  const [postOffice, setPostOffice] = useState("");
  // Auto-fill showroom address when selected
  useEffect(() => {
    if (deliveryMethod === "showroom_pickup") {
      setCity("Київ");
      setPostOffice("Самовивіз: вул. Костянтинівська, 21 (13:00–19:00)");
    } else {
      // Для способів Нової пошти не фіксуємо місто за замовчуванням
      setCity("");
      setPostOffice("");
    }
  }, [deliveryMethod]);

  const [comment, setComment] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<{
    items: typeof items;
    customer: {
      name: string;
      email?: string;
      phone: string;
      city: string;
      postOffice: string;
      comment?: string;
      paymentType: string;
    };
  } | null>(null);

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

    const apiItems = items.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    // Сума до оплати
    const fullAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const amountToPay = paymentType === "prepay" ? 300 : fullAmount;

    // Конвертуємо в копійки
    // const amountInKopecks = Math.round(amountToPay * 100);

    // Формуємо замовлення для інвойсу
    // const basketOrder = items.map((item) => ({
    //   name: item.name,
    //   qty: item.quantity,
    //   sum: Math.round(item.price * item.quantity * 100),
    //   total: Math.round(item.price * item.quantity * 100),
    //   unit: "шт.",
    //   code: `${item.id}-${item.size}`,
    // }));

    try {
      // Create order and get payment URL
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
          comment,
          payment_type: paymentType,
          items: apiItems,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Помилка при оформленні замовлення.");
      } else {
        const data = await response.json();
        const { invoiceUrl, invoiceId } = data;

        localStorage.setItem(
          "submittedOrder",
          JSON.stringify({
            items,
            customer: {
              name: customerName,
              email,
              phone: phoneNumber,
              city,
              postOffice,
              comment,
              paymentType,
            },
            invoiceId,
          })
        );

        setSuccess("Замовлення успішно створено! Переходимо до оплати...");
        clearBasket();

        // Redirect to payment page after 2 seconds
        setTimeout(() => {
          window.location.href = invoiceUrl;
        }, 2000);
      }
    } catch (err) {
      setError("Помилка мережі. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedOrder = localStorage.getItem("submittedOrder");
    if (storedOrder) {
      setSubmittedOrder(JSON.parse(storedOrder));
      // localStorage.removeItem("submittedOrder");
    }
  }, []);

  // POST OFFICE
  const [cities, setCities] = useState<string[]>([]); // Available cities
  const [postOffices, setPostOffices] = useState<string[]>([]); // Available post offices
  const [loadingCities, setLoadingCities] = useState<boolean>(false); // Loading state for cities
  const [loadingPostOffices, setLoadingPostOffices] = useState<boolean>(false); // Loading state for post offices
  const [filteredCities, setFilteredCities] = useState<string[]>([]); // Filtered cities list for autocomplete
  const [filteredPostOffices, setFilteredPostOffices] = useState<string[]>([]); // Filtered post offices list for autocomplete
  const [cityListVisible, setCityListVisible] = useState(false);
  const [postOfficeListVisible, setPostOfficeListVisible] = useState(false);
  const [region, setRegion] = useState(""); // For Ukrposhta - область
  const [district, setDistrict] = useState(""); // For Ukrposhta - район
  const [regionListVisible, setRegionListVisible] = useState(false); // Controls region list visibility
  const [districtListVisible, setDistrictListVisible] = useState(false); // Controls district list visibility

  // Example useEffect for region and district fetching for Ukrposhta
  useEffect(() => {
    if (region) {
      setLoadingCities(true);
      // API call to fetch regions for Ukrposhta
      setLoadingCities(false);
    }
  }, [region]);

  useEffect(() => {
    if (district) {
      setLoadingPostOffices(true);
      // API call to fetch districts for Ukrposhta
      setLoadingPostOffices(false);
    }
  }, [district]);

  useEffect(() => {
    // Fetch available cities when delivery method changes to Nova Poshta
    if (deliveryMethod === "nova_poshta") {
      setLoadingCities(true);

      // Fetch cities with `fetch`
      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: city, // Replace with a dynamic city string if necessary
            limit: 20,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const cityData = data.data || [];
          setCities(cityData.map((city: { Description: unknown }) => city.Description));
          // console.log(data);
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
          setError("Failed to load cities.");
        })
        .finally(() => {
          setLoadingCities(false);
        });
    } else if (deliveryMethod == "ukrposhta") {
      setLoadingCities(true);

      // Fetch cities with `fetch`
      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: city, // Replace with a dynamic city string if necessary
            limit: 20,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const cityData = data.data || [];
          setCities(cityData.map((city: { Description: unknown }) => city.Description));
          // console.log(data);
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
          setError("Failed to load cities.");
        })
        .finally(() => {
          setLoadingCities(false);
        });
    }
  }, [deliveryMethod]);

  useEffect(() => {
    // Filter and sort the cities based on the current input
    const filtered = cities.filter((cityOption) =>
      cityOption.toLowerCase().includes(city.toLowerCase())
    );
    
    // Sort: exact matches first, then starts with, then contains
    const sorted = filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const searchLower = city.toLowerCase();
      
      // Exact match
      if (aLower === searchLower) return -1;
      if (bLower === searchLower) return 1;
      
      // Starts with
      const aStarts = aLower.startsWith(searchLower);
      const bStarts = bLower.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Alphabetical for remaining
      return a.localeCompare(b);
    });
    
    setFilteredCities(sorted);
  }, [city, cities]); // Re-filter cities whenever `city` or `cities` changes

  useEffect(() => {
    // Fetch available post offices when a city is selected
    if (city) {
      setLoadingPostOffices(true);

      // Fetch post offices with `fetch`
      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY, // Replace with your actual API Key
          modelName: "AddressGeneral",
          calledMethod: "getWarehouses",
          methodProperties: {
            CityName: city, // Use the selected city
            FindByString: postOffice,
            limit: 20,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const postOfficeData = data.data || [];
          setPostOffices(postOfficeData.map((post: { Description: unknown}) => post.Description));
          // console.log(data);
        })
        .catch((error) => {
          console.error("Error fetching post offices:", error);
          setError("Failed to load post offices.");
        })
        .finally(() => {
          setLoadingPostOffices(false);
        });
    }
  }, [city]);

  useEffect(() => {
    // Filter and sort the post offices based on the current input
    const filtered = postOffices.filter((postOfficeOption) =>
      postOfficeOption.toLowerCase().includes(postOffice.toLowerCase())
    );
    
    // Sort: exact matches first, then starts with, then contains
    const sorted = filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const searchLower = postOffice.toLowerCase();
      
      // Exact match
      if (aLower === searchLower) return -1;
      if (bLower === searchLower) return 1;
      
      // Starts with
      const aStarts = aLower.startsWith(searchLower);
      const bStarts = bLower.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Alphabetical for remaining
      return a.localeCompare(b);
    });
    
    setFilteredPostOffices(sorted);
  }, [postOffice, postOffices]); // Re-filter post offices whenever `postOffice` or `postOffices` changes

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setCityListVisible(true); // Show the city list while typing
  };

  const handlePostOfficeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostOffice(e.target.value);
    setPostOfficeListVisible(true); // Show the post office list while typing
  };

  // Handling changes for region and district (for Ukrposhta)
  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegion(e.target.value);
    setRegionListVisible(true); // Show region list while typing
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDistrict(e.target.value);
    setDistrictListVisible(true); // Show district list while typing
  };

  const handleCitySelect = (cityOption: string) => {
    setCity(cityOption);
    setCityListVisible(false); // Hide the city list after selecting an option
  };

  const handlePostOfficeSelect = (postOfficeOption: string) => {
    setPostOffice(postOfficeOption);
    setPostOfficeListVisible(false); // Hide the post office list after selecting an option
  };

  // Handle the selection of region and district for Ukrposhta
  const handleRegionSelect = (regionOption: string) => {
    setRegion(regionOption);
    setRegionListVisible(false); // Hide region list after selection
  };

  const handleDistrictSelect = (districtOption: string) => {
    setDistrict(districtOption);
    setDistrictListVisible(false); // Hide district list after selection
  };

  // STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ⬇️ When order is completed
  if (items.length == 0 && submittedOrder) {
    const { items: orderItems, customer } = submittedOrder;

    return (
      <section className="max-w-[1280px] w-full mx-auto p-6 flex flex-col items-center gap-10">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-normal leading-tight">
            <span className="text-stone-500">Дякуємо за </span>
            <span className="">ваше замовлення!</span>
          </h1>
        </div>

        {/* Layout container */}
        <div className="flex flex-col md:flex-row justify-around gap-10 w-full">
          {/* Vertical Swiper */}
          <div className="w-full md:w-1/2 h-[450px]">
            <Swiper
              direction="vertical"
              modules={[Mousewheel]}
              mousewheel
              spaceBetween={0}
              slidesPerView={2.5}
              className="h-full"
            >
              {orderItems.map((item, idx) => (
                <SwiperSlide key={`${item.id}-${item.size}-${idx}`}>
                  <div className="flex gap-4 items-start p-4 border border-stone-200 rounded">
                    {item.imageUrl ? (
                      <img
                        src={`/api/images/${item.imageUrl}`}
                        alt={item.name}
                        className="w-20 h-28 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Фото</span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="text-base font-['Inter'] ">
                        {item.name}
                      </div>
                      <div className="text-base  font-['Helvetica']">
                        {item.size}
                      </div>
                      <div className="text-base  font-['Helvetica']">
                        Кількість: {item.quantity}x
                      </div>
                      <div className="text-base text-zinc-600 font-['Helvetica']">
                        {(item.price * item.quantity).toFixed(2)} ₴
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Customer Info */}
          {/* Title */}
          <div className="flex flex-col justify-between gap-3">
            <div className="text-3xl  font-normal text-center">
              Дані клієнта
            </div>
            <div className="text-xl font-normal leading-loose w-full md:w-1/3 text-left">
              <p className="flex justify-start gap-3">
                <span className="">Ім’я: </span>
                <span className="text-neutral-400">{customer.name}</span>
              </p>
              {customer.email && (
                <p className="flex justify-start gap-3">
                  <span className="">Email: </span>
                  <span className="text-neutral-400">{customer.email}</span>
                </p>
              )}
              <p className="flex justify-start gap-3">
                <span className="">Телефон: </span>
                <span className="text-neutral-400">{customer.phone}</span>
              </p>
              <p className="flex justify-start gap-3">
                <span className="">Місто: </span>
                <span className="text-neutral-400">{customer.city}</span>
              </p>
              <p className="flex justify-start gap-3">
                <span className="">Відділення: </span>
                <span className="text-neutral-400">{customer.postOffice}</span>
              </p>
              {customer.comment && (
                <p className="flex justify-start gap-3">
                  <span className="">Коментар: </span>
                  <span className="text-neutral-400">{customer.comment}</span>
                </p>
              )}
            </div>
            {/* Back to home */}
            <Link
              href="/"
              className={`w-80 h-16 ${isDark ? "bg-stone-100 text-black" : "bg-stone-900 text-white" } inline-flex justify-center items-center gap-2.5 p-2.5 rounded`}
            >
              <span className=" text-xl font-medium font-['Inter'] tracking-tight leading-snug">
                На головну
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1922px] w-full mx-auto relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {items.length == 0 ? (
        <div className="py-12 px-4 sm:py-20 flex flex-col items-center gap-10 sm:gap-14 w-full max-w-2xl mx-auto">
          <Image
            src={`${
              isDark
                ? "/images/dark-theme/basket.svg"
                : "/images/light-theme/basket.svg"
            }`}
            alt="shopping basket icon"
            width={200}
            height={200}
          />
          <span className="text-center text-2xl sm:text-4xl md:text-6xl font-normal font-['Inter'] leading-tight sm:leading-[64.93px]">
            Ваш кошик порожній
          </span>
          <Link
            href="/catalog"
            className={`${
              isDark
                ? "bg-stone-100 text-stone-900"
                : "bg-stone-900 text-stone-100"
            } w-full sm:w-80 h-14 sm:h-16 px-6 py-3 inline-flex items-center justify-center gap-2.5 text-base sm:text-xl text-center `}
          >
            Продовжити покупки
          </Link>
        </div>
      ) : (
        <>
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
                autoComplete="name"
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
                autoComplete="email"
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
                pattern="^\+?\d{10,15}$"
                title="Введіть номер телефону у форматі +380xxxxxxxxx"
                className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoComplete="tel"
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
                <option value="nova_poshta_branch">Нова пошта — у відділення</option>
                <option value="nova_poshta_locker">Нова пошта — у поштомат</option>
                <option value="nova_poshta_courier">Нова пошта — кур’єром</option>
                {/* <option value="ukrposhta">Укрпошта</option> */}
                <option value="showroom_pickup">Самовивіз з шоуруму (13:00–19:00)</option>
              </select>

              {deliveryMethod.startsWith("nova_poshta") && (
                <>
                  <div className="flex flex-col">
                    <label
                      htmlFor="city"
                      className="text-xl sm:text-2xl font-normal font-['Arial']"
                    >
                      {deliveryMethod === "nova_poshta_courier" ? "Місто для доставки кур’єром *" : "Місто *"}
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={handleCityChange} // Update city on input change
                      placeholder="Введіть назву міста"
                      className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                      required
                    />
                    {loadingCities ? (
                      <p>Завантаження міст...</p>
                    ) : (
                      cityListVisible && (
                        <div className="max-h-40 overflow-y-auto shadow-lg rounded border mt-2">
                          <ul className="list-none p-0">
                            {filteredCities.map((cityOption, idx) => (
                              <li
                                key={idx}
                                className="p-3 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleCitySelect(cityOption)} // Set city on click
                              >
                                {cityOption}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>

                  {/* Post Office Input with Autocomplete */}
                  {deliveryMethod === "nova_poshta_courier" ? (
                    <div className="flex flex-col">
                      <label
                        htmlFor="postOffice"
                        className="text-xl sm:text-2xl font-normal font-['Arial']"
                      >
                        Адреса доставки (вулиця, будинок, квартира) *
                      </label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={(e) => setPostOffice(e.target.value)}
                        placeholder="Напр.: вул. Січових Стрільців, 10, кв. 25"
                        className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <label
                        htmlFor="postOffice"
                        className="text-xl sm:text-2xl font-normal font-['Arial']"
                      >
                        {deliveryMethod === "nova_poshta_locker" ? "Поштомат *" : "Відділення *"}
                      </label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={handlePostOfficeChange}
                        placeholder={deliveryMethod === "nova_poshta_locker" ? "Введіть назву поштомата" : "Введіть назву відділення"}
                        className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                        required
                      />
                      {loadingPostOffices ? (
                        <p>Завантаження відділень...</p>
                      ) : (
                        postOfficeListVisible && (
                          <div className="max-h-40 overflow-y-auto shadow-lg rounded border mt-2">
                            <ul className="list-none p-0">
                              {filteredPostOffices.map((postOfficeOption, idx) => (
                                  <li
                                    key={idx}
                                    className="p-3 cursor-pointer hover:bg-gray-200"
                                    onClick={() =>
                                      handlePostOfficeSelect(postOfficeOption)
                                    }
                                  >
                                    {postOfficeOption}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </>
              )}

              {deliveryMethod === "showroom_pickup" && (
                <div className="text-base sm:text-lg text-gray-700">
                  Самовивіз з шоуруму з 13:00 до 19:00, Київ, вул. Костянтинівська, 21
                </div>
              )}

              <label
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
              />

              <label
                htmlFor="paymentType"
                className="text-xl sm:text-2xl font-normal font-['Arial']"
              >
                Спосіб оплати *
              </label>
              <select
                id="paymentType"
                className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                required
              >
                <option value="">Оберіть спосіб оплати</option>
                <option value="full">Повна оплата</option>
                <option value="prepay">Передоплата 300 ₴</option>
              </select>

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

            <div className="w-full sm:w-1/4 px-4 sm:px-0 flex flex-col gap-4">
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
                      src={item.imageUrl ? `/api/images/${item.imageUrl}` : "https://placehold.co/200x300/cccccc/666666?text=No+Image"}
                      alt={item.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200x300/cccccc/666666?text=No+Image";
                      }}
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
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity + 1
                              )
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
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity - 1
                              )
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
                          <Image
                            src={"/images/trashcan.svg"}
                            width={30}
                            height={30}
                            alt={""}
                          ></Image>
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
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                    .toFixed(2)}{" "}
                  ₴
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
