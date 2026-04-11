"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Mousewheel } from "swiper/modules";
import "swiper/css/scrollbar";
import FormField, { validators } from "@/components/shared/FormField";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { trackFbq, trackFbqPurchase } from "@/lib/fbq";

const COUNTRY_OPTIONS = [
  { code: "UA", uk: "Україна", en: "Ukraine", de: "Ukraine" },
  { code: "PL", uk: "Польща", en: "Poland", de: "Polen" },
  { code: "DE", uk: "Німеччина", en: "Germany", de: "Deutschland" },
  { code: "CZ", uk: "Чехія", en: "Czech Republic", de: "Tschechien" },
  { code: "SK", uk: "Словаччина", en: "Slovakia", de: "Slowakei" },
  { code: "RO", uk: "Румунія", en: "Romania", de: "Rumänien" },
  { code: "HU", uk: "Угорщина", en: "Hungary", de: "Ungarn" },
  { code: "IT", uk: "Італія", en: "Italy", de: "Italien" },
  { code: "ES", uk: "Іспанія", en: "Spain", de: "Spanien" },
  { code: "FR", uk: "Франція", en: "France", de: "Frankreich" },
  { code: "GB", uk: "Велика Британія", en: "United Kingdom", de: "Vereinigtes Königreich" },
  { code: "US", uk: "США", en: "USA", de: "USA" },
  { code: "CA", uk: "Канада", en: "Canada", de: "Kanada" },
  { code: "OTHER", uk: "Інша країна", en: "Other country", de: "Anderes Land" },
] as const;

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
  const { items, updateQuantity, removeItem, clearBasket, currency } = useBasket();
  const searchParams = useSearchParams();
  const { locale, messages, withLocalePath } = useI18n();
  const effectiveBasketCurrency =
    currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH");

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

  // Meta Pixel: InitiateCheckout — користувач перейшов на сторінку оформлення (один раз за візит)
  const initiateCheckoutSent = useRef(false);
  useEffect(() => {
    if (initiateCheckoutSent.current || !items.length) return;
    initiateCheckoutSent.current = true;
    const value = items.reduce(
      (sum, item) =>
        sum +
        (effectiveBasketCurrency === "EUR" && item.price_eur != null
          ? item.price_eur * item.quantity
          : item.price * item.quantity),
      0
    );
    const numItems = items.reduce((s, i) => s + i.quantity, 0);
    trackFbq("InitiateCheckout", {
      value: Math.round(value * 100) / 100,
      currency: effectiveBasketCurrency,
      content_ids: items.map((i) => String(i.id)),
      content_type: "product",
      num_items: numItems,
    });
  }, [items, effectiveBasketCurrency]);

  const [comment, setComment] = useState("");
  const [paymentType, setPaymentType] = useState<"" | "full" | "prepay">("full");
  const [countryCode, setCountryCode] = useState<string>("UA");
  const [countryName, setCountryName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<{
    items: typeof items;
    orderCurrency: "UAH" | "EUR";
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

  const isUkraineShipping = countryCode === "UA";

  // Keep delivery method in sync with country:
  // - For Ukraine: default to Nova Poshta branch if current метод не підходить
  // - For other countries: only international shipping is available
  useEffect(() => {
    if (isUkraineShipping) {
      if (!deliveryMethod.startsWith("nova_poshta") && deliveryMethod !== "showroom_pickup") {
        setDeliveryMethod("nova_poshta_branch");
      }
    } else {
      if (deliveryMethod !== "international_shipping") {
        setDeliveryMethod("international_shipping");
      }
    }
  }, [isUkraineShipping, deliveryMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const needsCustomCountryName = !isUkraineShipping && countryCode === "OTHER";

    if (
      !customerName ||
      !phoneNumber ||
      !deliveryMethod ||
      !city ||
      (isUkraineShipping && !postOffice) ||
      (!isUkraineShipping &&
        ((needsCustomCountryName && !countryName.trim()) ||
          !postalCode.trim() ||
          !streetAddress.trim()))
    ) {
      setError(messages.checkout.errorRequiredFields);
      setLoading(false);
      return;
    }

    const trimmedName = customerName.trim();
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 2) {
      setError(messages.checkout.errorFullName);
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError(messages.checkout.errorCartEmpty);
      setLoading(false);
      return;
    }

    const isEuro = effectiveBasketCurrency === "EUR";
    const getItemPrice = (item: (typeof items)[0]) =>
      isEuro && item.price_eur != null ? item.price_eur : item.price;

    // Формуємо товари для API у вибраній валюті (з урахуванням знижки)
    const apiItems = items.map((item) => {
      const rawItemPrice = getItemPrice(item);
      const itemPrice =
        typeof rawItemPrice === "string"
          ? parseFloat(rawItemPrice)
          : rawItemPrice;
      const discount = item.discount_percentage
        ? typeof item.discount_percentage === "string"
          ? parseFloat(item.discount_percentage)
          : item.discount_percentage
        : 0;
      const discountedPrice =
        discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;

      return {
        product_id: item.id,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: discountedPrice.toFixed(2),
        original_price: itemPrice,
        discount_percentage: discount || null,
        color: item.color || null,
      };
    });

    const fullAmount = items.reduce((total, item) => {
      const rawItemPrice = getItemPrice(item);
      const itemPrice =
        typeof rawItemPrice === "string"
          ? parseFloat(rawItemPrice)
          : rawItemPrice;
      const discount = item.discount_percentage
        ? typeof item.discount_percentage === "string"
          ? parseFloat(item.discount_percentage)
          : item.discount_percentage
        : 0;
      const price =
        discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;
      return total + price * item.quantity;
    }, 0);

    try {
      const resolveCountryLabel = (code: string): string => {
        const found = COUNTRY_OPTIONS.find((c) => c.code === code);
        if (!found) return code || "International";
        if (locale === "en") return found.en;
        if (locale === "de") return found.de;
        return found.uk;
      };

      const shippingCountry = isUkraineShipping
        ? resolveCountryLabel("UA")
        : countryCode === "OTHER"
        ? countryName.trim() || "International"
        : resolveCountryLabel(countryCode);
      const apiCity = city;
      const apiPostOffice = isUkraineShipping
        ? postOffice
        : `Country: ${shippingCountry}; Postal code: ${postalCode.trim()}; Address: ${streetAddress.trim()}`;

      const requestBody = {
        customer_name: customerName,
        phone_number: phoneNumber,
        email: email || null,
        delivery_method: deliveryMethod,
        city: apiCity,
        post_office: apiPostOffice,
        comment,
        payment_type: paymentType,
        total_amount: fullAmount.toFixed(2),
        currency: isEuro ? "EUR" : "UAH",
        locale, // запам'ятовуємо мовну версію сайту
        items: apiItems,
      };

      // Надсилаємо дані замовлення
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("[FinalCard] Error response:", data);
        setError(data.error || messages.checkout.errorGeneric);
      } else {
        const data = await response.json();
        const { invoiceUrl, invoiceId } = data;

        if (!invoiceUrl) {
          console.error("[FinalCard] No invoice URL received!");
          setError(messages.checkout.errorNoInvoice);
          return;
        }


        // Meta Pixel кастомні події (Purchase) вимкнені

        localStorage.setItem(
          "submittedOrder",
          JSON.stringify({
            items,
            orderCurrency: effectiveBasketCurrency,
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

        // Clear any old invoiceId and payment success flag before storing the new one
        localStorage.removeItem("currentInvoiceId");
        localStorage.removeItem("paymentSuccess");
        // Store invoiceId separately for payment status check
        localStorage.setItem("currentInvoiceId", invoiceId);

        setSuccess(messages.checkout.orderCreatedRedirecting);
        // Don't clear basket here - only clear after successful payment
        // Перехід на сторінку оплати через 2 сек
        setTimeout(() => {
          window.location.href = invoiceUrl;
        }, 2000);
      }
    } catch (error) {
      console.error("[FinalCard] Network error:", error);
      setError(messages.checkout.errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedOrder = localStorage.getItem("submittedOrder");
    if (storedOrder) {
      setSubmittedOrder(JSON.parse(storedOrder));
    }

    const paymentSuccessFromQuery = searchParams.get("payment") === "success";
    const paymentSuccessFromStorage =
      typeof window !== "undefined" &&
      localStorage.getItem("paymentSuccess") === "true";
    const paymentSuccess = paymentSuccessFromQuery || paymentSuccessFromStorage;

    if (items.length === 0 && storedOrder && !paymentSuccess) {
      localStorage.removeItem("submittedOrder");
      setSubmittedOrder(null);
    }
  }, [items.length, searchParams]);

  // Purchase + UI після оплати: спочатку fbq Purchase, потім replaceState (інакше зміна searchParams
  // обриває fetch через cleanup попереднього ефекту — подія не відправлялась).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (searchParams.get("payment") !== "success") return;
    const invoiceId = searchParams.get("invoiceId");
    if (!invoiceId) return;

    const g = globalThis as typeof globalThis & {
      __charsFbqPurchaseDone?: Set<string>;
    };
    const done = (g.__charsFbqPurchaseDone ??= new Set<string>());

    let cancelled = false;
    void (async () => {
      try {
        if (!done.has(invoiceId)) {
          const res = await fetch(
            `/api/orders/invoice/${encodeURIComponent(invoiceId)}`
          );
          if (res.ok) {
            const order: {
              id: number;
              currency?: string | null;
              items: Array<{
                product_name: string;
                quantity: number;
                price: number | string;
              }>;
            } = await res.json();
            if (cancelled) return;
            trackFbqPurchase(order);
            done.add(invoiceId);
          }
        }
      } catch (err: unknown) {
        console.error("[FinalCard] Purchase tracking:", err);
      }

      if (cancelled) return;

      setSuccess(messages.checkout.paymentSuccess);
      clearBasket();
      localStorage.setItem("paymentSuccess", "true");
      localStorage.removeItem("currentInvoiceId");

      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("invoiceId");
      window.history.replaceState({}, "", url.pathname + url.search);
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, clearBasket, messages.checkout.paymentSuccess]);

  // POST OFFICE
  const [cities, setCities] = useState<string[]>([]); // Available cities
  const [postOffices, setPostOffices] = useState<string[]>([]); // Available post offices
  const [loadingCities, setLoadingCities] = useState<boolean>(false); // Loading state for cities
  const [loadingPostOffices, setLoadingPostOffices] = useState<boolean>(false); // Loading state for post offices
  const [filteredCities, setFilteredCities] = useState<string[]>([]); // Filtered cities list for autocomplete
  const [filteredPostOffices, setFilteredPostOffices] = useState<string[]>([]); // Filtered post offices list for autocomplete
  const [cityListVisible, setCityListVisible] = useState(false);
  const [postOfficeListVisible, setPostOfficeListVisible] = useState(false);
  // Removed unused state variables and related useEffect hooks for region/district

  useEffect(() => {
    // Fetch available cities when delivery method changes to Nova Poshta
    if (deliveryMethod.startsWith("nova_poshta")) {
      setLoadingCities(true);

      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: city,
            limit: 20,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("City fetch response", data); // ✅ Add this
          if (data.success) {
            const cityData = data.data || [];
            setCities(
              cityData.map((c: { Description: string }) => c.Description)
            );
          } else {
            setCities([]);
            setError(messages.checkout.errorCitiesGeneric);
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError(messages.checkout.errorCitiesNetwork);
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
          setCities(
            cityData.map((city: { Description: unknown }) => city.Description)
          );
          // console.log(data);
        })
        .catch(() => {
          console.error("Error fetching cities");
          setError(messages.checkout.errorCitiesGeneric);
        })
        .finally(() => {
          setLoadingCities(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setPostOffices(
            postOfficeData.map(
              (post: { Description: unknown }) => post.Description
            )
          );
          // console.log(data);
        })
        .catch(() => {
          console.error("Error fetching post offices");
          setError(messages.checkout.errorWarehousesGeneric);
        })
        .finally(() => {
          setLoadingPostOffices(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCitySelect = (cityOption: string) => {
    setCity(cityOption);
    setCityListVisible(false); // Hide the city list after selecting an option
  };

  const handlePostOfficeSelect = (postOfficeOption: string) => {
    setPostOffice(postOfficeOption);
    setPostOfficeListVisible(false); // Hide the post office list after selecting an option
  };

  // STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ⬇️ When order is completed - show order details only after successful payment
  const paymentSuccessFromQuery = searchParams.get("payment") === "success";
  const paymentSuccessFromStorage = typeof window !== "undefined" && localStorage.getItem("paymentSuccess") === "true";
  const paymentSuccess = paymentSuccessFromQuery || paymentSuccessFromStorage;
  
  if (items.length == 0 && submittedOrder && paymentSuccess) {
    const { items: orderItems, customer } = submittedOrder;
    const orderCurrency =
      submittedOrder.orderCurrency ??
      (locale === "en" || locale === "de" ? "EUR" : "UAH");
    const summarySymbol = orderCurrency === "EUR" ? "€" : "₴";
    const getSummaryPrice = (item: (typeof orderItems)[0]) =>
      orderCurrency === "EUR" && item.price_eur != null ? item.price_eur : item.price;

    return (
      <section className="max-w-[1280px] w-full mx-auto p-6 flex flex-col items-center gap-10">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-normal leading-tight">
            <span className="text-stone-500">
              {messages.checkout.summaryThankYouLine1}{" "}
            </span>
            <span className="">{messages.checkout.summaryThankYouLine2}</span>
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
              {orderItems.map((item, idx) => {
                const displayPrice = getSummaryPrice(item);
                return (
                <SwiperSlide key={`${item.id}-${item.size}-${idx}`}>
                  <div className="flex gap-4 items-start p-4 border border-stone-200 rounded">
                    {item.imageUrl ? (
                      <div className="relative w-20 h-28">
                        <Image
                          src={`/api/images/${item.imageUrl}`}
                          alt={item.name}
                          width={80}
                          height={112}
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">
                          {messages.product.imagePlaceholder}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="text-base font-['Inter'] ">
                        {item.name}
                      </div>
                      <div className="text-base  font-['Helvetica']">
                        {item.size}
                      </div>
                      {item.color && (
                        <div className="text-base font-['Helvetica']">
                          {messages.product.colorLabel}:{" "}
                          {messages.catalog.colorNames[item.color] || item.color}
                        </div>
                      )}
                      <div className="text-base  font-['Helvetica']">
                        {messages.checkout.itemQtyLabel}: {item.quantity}x
                      </div>
                      <div className="text-base text-zinc-600 font-['Helvetica']">
                        {item.discount_percentage ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-red-600">
                              {(
                                displayPrice *
                                (1 - item.discount_percentage / 100)
                              ).toFixed(2)}
                              {summarySymbol}
                            </span>
                            <span className="text-gray-500 line-through">
                              {displayPrice}
                              {summarySymbol}
                            </span>
                            <span className="text-green-600 text-sm">
                              -{item.discount_percentage}%
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {displayPrice}
                            {summarySymbol}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              )})}
            </Swiper>
          </div>

          {/* Customer Info */}
          {/* Title */}
          <div className="flex flex-col justify-between gap-3">
            <div className="text-3xl  font-normal text-center">
              {messages.checkout.customerDataTitle}
            </div>
            <div className="text-xl font-normal leading-loose w-full max-w-4xl text-left">
              <p className="flex justify-start gap-3">
                <span className="">
                  {messages.checkout.summaryNameLabel}
                </span>
                <span className="text-neutral-400">{customer.name}</span>
              </p>
              {customer.email && (
                <p className="flex justify-start gap-3">
                  <span className="">Email: </span>
                  <span className="text-neutral-400">{customer.email}</span>
                </p>
              )}
              <p className="flex justify-start gap-3">
                <span className="">
                  {messages.checkout.summaryPhoneLabel}
                </span>
                <span className="text-neutral-400">{customer.phone}</span>
              </p>
              <p className="flex justify-start gap-3">
                <span className="">
                  {messages.checkout.summaryCityLabel}
                </span>
                <span className="text-neutral-400">{customer.city}</span>
              </p>
              <p className="flex justify-start gap-3">
                <span className="">
                  {messages.checkout.summaryPostOfficeLabel}
                </span>
                <span className="text-neutral-400">{customer.postOffice}</span>
              </p>
              {customer.comment && (
                <p className="flex justify-start gap-3">
                  <span className="">
                    {messages.checkout.summaryCommentLabel}
                  </span>
                  <span className="text-neutral-400">{customer.comment}</span>
                </p>
              )}
            </div>
            {/* Back to home */}
            <Link
              href={withLocalePath("/")}
              className={`w-80 h-16 ${
                isDark ? "bg-stone-100 text-black" : "bg-stone-900 text-white"
              } inline-flex justify-center items-center gap-2.5 p-2.5 rounded`}
              >
              <span className=" text-xl font-medium font-['Inter'] tracking-tight leading-snug">
                {messages.common.backToHome}
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
            {messages.checkout.emptyTitle}
          </span>
          <Link
            href={withLocalePath("/catalog")}
            className={`${
              isDark
                ? "bg-stone-100 text-stone-900"
                : "bg-stone-900 text-stone-100"
            } w-full sm:w-80 h-16 sm:h-20 px-8 py-4 inline-flex items-center justify-center gap-2.5 text-lg sm:text-2xl text-center `}
            >
            {messages.checkout.continueShopping}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
            <div className="mt-10 text-center sm:text-left text-3xl sm:text-6xl font-normal font-['Inter'] leading-snug sm:leading-[64.93px] mb-5">
              {messages.checkout.title}
            </div>

            <div className="w-full sm:w-1/4"></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 w-full sm:w-1/3"
              noValidate
            >
              <FormField
                label={messages.checkout.nameLabel}
                id="name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={messages.checkout.namePlaceholder}
                required
                autoComplete="name"
                validation={(value) => {
                  const required = validators.required(value);
                  if (required) return required;
                  return validators.fullName(value);
                }}
              />

              <FormField
                label={messages.checkout.emailLabel}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={messages.checkout.emailPlaceholder}
                autoComplete="email"
                validation={validators.email}
              />

              <FormField
                label={messages.checkout.phoneLabel}
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={messages.checkout.phonePlaceholder}
                required
                autoComplete="tel"
                validation={(value) => {
                  const required = validators.required(value);
                  if (required) return required;
                  return validators.phone(value);
                }}
              />

              {/* Add delivery method, city, and post office fields */}
              {/* Country selector */}
              <label
                htmlFor="country"
                className="text-xl sm:text-2xl font-normal font-['Arial']"
              >
                {messages.checkout.countryLabel}
              </label>
              <select
                id="country"
                className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded mb-2"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {locale === "en"
                      ? opt.en
                      : locale === "de"
                      ? opt.de
                      : opt.uk}
                  </option>
                ))}
              </select>
              {!isUkraineShipping && countryCode === "OTHER" && (
                <div className="flex flex-col mb-2">
                  <label
                    htmlFor="countryName"
                    className="text-base sm:text-lg font-normal font-['Arial']"
                  >
                    {messages.checkout.countryOtherLabel}
                  </label>
                  <input
                    id="countryName"
                    type="text"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    placeholder={messages.checkout.countryOtherPlaceholder}
                    className="border p-3 sm:p-4 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                  />
                </div>
              )}

              <label
                htmlFor="deliveryMethod"
                className="text-xl sm:text-2xl font-normal font-['Arial']"
              >
                {messages.checkout.deliveryMethodLabel}
              </label>
              <select
                id="deliveryMethod"
                className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                required
              >
                <option value="">
                  {messages.checkout.deliveryMethodPlaceholder}
                </option>
                {isUkraineShipping ? (
                  <>
                    <option value="nova_poshta_branch">
                      {messages.checkout.deliveryOptionNpBranch}
                    </option>
                    <option value="nova_poshta_locker">
                      {messages.checkout.deliveryOptionNpLocker}
                    </option>
                    <option value="nova_poshta_courier">
                      {messages.checkout.deliveryOptionNpCourier}
                    </option>
                    <option value="showroom_pickup">
                      {messages.checkout.deliveryOptionShowroom}
                    </option>
                  </>
                ) : (
                  <option value="international_shipping">
                    {messages.checkout.deliveryOptionInternational}
                  </option>
                )}
              </select>

              {isUkraineShipping && deliveryMethod.startsWith("nova_poshta") && (
                <>
                  <div className="flex flex-col">
                    <label
                      htmlFor="city"
                      className="text-xl sm:text-2xl font-normal font-['Arial']"
                    >
                      {deliveryMethod === "nova_poshta_courier"
                        ? messages.checkout.cityCourierLabel
                        : messages.checkout.cityLabel}
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={handleCityChange} // Update city on input change
                      placeholder={messages.checkout.cityPlaceholder}
                      className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                      required
                    />
                    {loadingCities ? (
                      <p>{messages.checkout.citiesLoading}</p>
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
                        {messages.checkout.addressLabel}
                      </label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={(e) => setPostOffice(e.target.value)}
                        placeholder={messages.checkout.addressPlaceholder}
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
                        {deliveryMethod === "nova_poshta_locker"
                          ? messages.checkout.postOfficeLockerLabel
                          : messages.checkout.postOfficeLabel}
                      </label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={handlePostOfficeChange}
                        placeholder={
                          deliveryMethod === "nova_poshta_locker"
                            ? messages.checkout.postOfficeLockerPlaceholder
                            : messages.checkout.postOfficePlaceholder
                        }
                        className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                        required
                      />
                      {loadingPostOffices ? (
                        <p>{messages.checkout.postOfficesLoading}</p>
                      ) : (
                        postOfficeListVisible && (
                          <div className="max-h-40 overflow-y-auto shadow-lg rounded border mt-2">
                            <ul className="list-none p-0">
                              {filteredPostOffices.map(
                                (postOfficeOption, idx) => (
                                  <li
                                    key={idx}
                                    className="p-3 cursor-pointer hover:bg-gray-200"
                                    onClick={() =>
                                      handlePostOfficeSelect(postOfficeOption)
                                    }
                                  >
                                    {postOfficeOption}
                                  </li>
                                )
                              )}
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
                  {messages.checkout.showroomInfo}
                </div>
              )}

              {/* International shipping fields */}
              {!isUkraineShipping && deliveryMethod === "international_shipping" && (
                <>
                  <div className="flex flex-col">
                    <label
                      htmlFor="city"
                      className="text-xl sm:text-2xl font-normal font-['Arial']"
                    >
                      {messages.checkout.cityLabel}
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={messages.checkout.cityPlaceholder}
                      className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="postalCode"
                      className="text-xl sm:text-2xl font-normal font-['Arial']"
                    >
                      {messages.checkout.postalCodeLabel}
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder={messages.checkout.postalCodePlaceholder}
                      className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="streetAddress"
                      className="text-xl sm:text-2xl font-normal font-['Arial']"
                    >
                      {messages.checkout.addressLabel}
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder={messages.checkout.addressPlaceholder}
                      className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">
                    {messages.checkout.internationalInfo}
                  </p>
                </>
              )}

              <label
                htmlFor="comment"
                className="text-xl sm:text-2xl font-normal font-['Arial']"
              >
                {messages.checkout.commentLabel}
              </label>
              <input
                type="text"
                id="comment"
                placeholder={messages.checkout.commentPlaceholder}
                className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <label
                htmlFor="paymentType"
                className="text-xl sm:text-2xl font-normal font-['Arial']"
              >
                {messages.checkout.paymentMethodLabel}
              </label>
              <select
                id="paymentType"
                className="border p-3 sm:p-5 text-lg sm:text-xl font-normal font-['Arial'] rounded"
                value={paymentType}
                onChange={(e) =>
                  setPaymentType(
                    e.target.value as "" | "full" | "prepay"
                  )
                }
                required
              >
                {!isUkraineShipping && (
                  <option value="">
                    {messages.checkout.paymentMethodPlaceholder}
                  </option>
                )}
                <option value="full">
                  {messages.checkout.paymentOptionFull}
                </option>
                {isUkraineShipping && (
                  <option value="prepay">
                    {messages.checkout.paymentOptionPrepay}
                  </option>
                )}
                <option value="paypal_disabled" disabled>
                  {messages.checkout.paymentOptionPaypalFull} (скоро)
                </option>
              </select>

              <button
                className={`${
                  isDark ? "bg-white text-black" : "bg-black text-white"
                } p-4 sm:p-5 rounded mt-3 font-semibold`}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? messages.checkout.submitSending
                  : messages.checkout.submitLabel}
              </button>

              {error && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-4 z-50 flex items-center gap-3 font-['Inter']">
                  <span className="text-sm md:text-base">
                    {error}
                  </span>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                    aria-label="Закрити"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {success && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-4 z-50 flex items-center gap-3 font-['Inter']">
                  <span className="text-sm md:text-base">
                    {success}
                  </span>
                  <button
                    onClick={() => setSuccess(null)}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                    aria-label="Закрити"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </form>

            <div className="w-full sm:w-1/4 px-4 sm:px-0 flex flex-col gap-4">
              {items.length === 0 ? (
                <p>{messages.checkout.basketEmptyInline}</p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="w-full rounded p-4 flex flex-col sm:flex-row gap-4 sm:gap-3 items-center"
                  >
                    <Image
                      className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded"
                      src={
                        item.imageUrl
                          ? `/api/images/${item.imageUrl}`
                          : "https://placehold.co/200x300/cccccc/666666?text=No+Image"
                      }
                      alt={item.name}
                      width={112}
                      height={160}
                    />
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="text-base font-normal font-['Inter'] leading-normal">
                        {item.name}
                      </div>
                      <div className="text-zinc-600 text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                        {(() => {
                          const symbol = effectiveBasketCurrency === "EUR" ? "€" : "₴";
                          const displayPrice =
                            effectiveBasketCurrency === "EUR" && item.price_eur != null
                              ? item.price_eur
                              : item.price;
                          return item.discount_percentage ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-red-600">
                                {(
                                  displayPrice *
                                  (1 - item.discount_percentage / 100)
                                ).toFixed(2)}
                                {symbol}
                              </span>
                              <span className="text-gray-500 line-through">
                                {displayPrice}
                                {symbol}
                              </span>
                              <span className="text-green-600 text-sm">
                                -{item.discount_percentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {displayPrice}
                              {symbol}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                        {item.size}
                      </div>
                      {item.color && (
                        <div className="text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                          {messages.checkout.itemColorLabel}:{" "}
                          {messages.catalog.colorNames[item.color] || item.color}
                        </div>
                      )}

                      <div className="flex justify-start items-center gap-3 mt-auto">
                        <div className="w-20 h-9 border border-neutral-400/60 flex justify-around items-center rounded">
                          <button
                            className={`text-zinc-500 text-base font-normal font-['Inter'] leading-normal ${
                              item.stock !== undefined && item.quantity >= item.stock
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:text-black dark:hover:text-white"
                            }`}
                            onClick={() => {
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity + 1,
                                (errorMessage) => {
                                  // Show error alert when stock limit is reached
                                  setError(errorMessage);
                                  setTimeout(() => setError(null), 4000);
                                }
                              );
                            }}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            title={
                              item.stock !== undefined && item.quantity >= item.stock
                                ? messages.checkout.maxStockTitle(
                                    item.stock as number
                                  )
                                : messages.checkout.increaseQtyTitle
                            }
                          >
                            +
                          </button>
                          <div className="text-base font-normal font-['Inter'] leading-normal">
                            {item.quantity}
                            {item.stock !== undefined && (
                              <span className="text-xs text-gray-500 ml-1">
                                / {item.stock}
                              </span>
                            )}
                          </div>
                          <button
                            className="text-zinc-500 text-base font-normal font-['Inter'] leading-normal hover:text-black dark:hover:text-white"
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

              {/* Total price container — у вибраній валюті з хедера */}
              <div className="p-5 border-t flex justify-between text-base sm:text-2xl font-normal font-['Arial'] mt-4">
                <div>{messages.checkout.totalLabel}</div>
                <div className="font-['Helvetica'] leading-relaxed tracking-wide">
                  {items
                    .reduce((total, item) => {
                      const unitPrice =
                        effectiveBasketCurrency === "EUR" && item.price_eur != null
                          ? item.price_eur
                          : item.price;
                      const price = item.discount_percentage
                        ? unitPrice * (1 - item.discount_percentage / 100)
                        : unitPrice;
                      return total + price * item.quantity;
                    }, 0)
                    .toFixed(2)}{" "}
                  {effectiveBasketCurrency === "EUR" ? "€" : "₴"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
