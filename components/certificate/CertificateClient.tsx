"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Alert from "@/components/shared/Alert";
import CertificatePreview from "./CertificatePreview";
import {
  CERTIFICATE_TIERS,
  formatCertificateAmount,
  type CertificateTier,
} from "@/lib/certificates";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export default function CertificateClient() {
  const { isDark } = useAppContext();
  const { locale, messages } = useI18n();
  const { currency } = useBasket();
  const effectiveCurrency =
    currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH");
  const isEuro = effectiveCurrency === "EUR";

  const [selectedTier, setSelectedTier] = useState<CertificateTier>(
    CERTIFICATE_TIERS[1]
  );
  const [showForm, setShowForm] = useState(false);
  useBodyScrollLock(showForm);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const displayPrice = isEuro ? selectedTier.eur : selectedTier.uah;

  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleBuy = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim()) {
      showAlert(messages.certificate.fillAllFields, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone_number: phone.trim(),
          email: email.trim(),
          amount_uah: selectedTier.uah,
          currency: isEuro ? "EUR" : "UAH",
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.error === "fill_required_fields"
            ? messages.certificate.fillAllFields
            : typeof data.error === "string"
              ? data.error
              : messages.certificate.errorGeneric;
        showAlert(errorMsg, "error");
        return;
      }

      const { invoiceUrl, invoiceId, paymentRef } = data;

      if (!invoiceUrl) {
        showAlert(messages.certificate.errorGeneric, "error");
        return;
      }

      localStorage.setItem("currentInvoiceId", invoiceId);
      if (paymentRef) {
        localStorage.setItem("currentPaymentRef", paymentRef);
      }
      showAlert(messages.certificate.redirecting, "success");

      setTimeout(() => {
        window.location.href = invoiceUrl;
      }, 1500);
    } catch {
      showAlert(messages.certificate.errorGeneric, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="site-shell">
      <div className="site-px flex flex-col lg:flex-row justify-between pb-4 pt-1 md:pb-8 md:pt-2 gap-10">
        <div
          className={`relative w-full lg:w-1/2 flex flex-col items-center transition-opacity duration-300 ${
            isDark ? "bg-[#141414]" : "bg-[#eef7ff]"
          } py-4 lg:py-6 rounded-sm`}
        >
          <CertificatePreview
            tier={selectedTier}
            currency={effectiveCurrency}
          />
        </div>

        <div className="flex flex-col gap-4 md:gap-5 w-full lg:w-1/2">
          <div className="text-base md:text-lg font-normal font-['Helvetica'] leading-relaxed tracking-wide text-[#072a6b]">
            {messages.certificate.availabilityLabel}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal capitalize leading-tight">
            {messages.certificate.title}
          </h1>

          <p className="text-base md:text-lg leading-relaxed opacity-80">
            {messages.certificate.subtitle}
          </p>

          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-4 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-['Helvetica'] font-medium">
                {formatCertificateAmount(displayPrice, effectiveCurrency)}
              </span>
              <span className="text-sm opacity-60">
                {messages.certificate.amountPrefix}{" "}
                {formatCertificateAmount(displayPrice, effectiveCurrency)}
              </span>
            </div>
          </div>

          <div className="text-base md:text-lg uppercase tracking-tight">
            {messages.certificate.chooseAmountLabel}
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            {CERTIFICATE_TIERS.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              const label = isEuro
                ? formatCertificateAmount(tier.eur, "EUR")
                : formatCertificateAmount(tier.uah, "UAH");

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`min-w-[88px] px-4 py-3 border-2 flex justify-center text-base md:text-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-black dark:border-white font-bold scale-105 shadow-md"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 hover:scale-105"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleBuy}
            className={`w-full py-4 md:py-5 text-base md:text-lg uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
              isDark
                ? "bg-white text-black hover:bg-stone-200"
                : "bg-black text-white hover:bg-stone-800"
            }`}
          >
            {messages.certificate.buyButton}
          </button>

          <div className="mt-2">
            <h2 className="text-xl md:text-2xl uppercase tracking-tight mb-3">
              {messages.certificate.descriptionTitle}
            </h2>
            <p className="text-base md:text-lg leading-relaxed opacity-80 mb-4">
              {messages.certificate.description}
            </p>
            <ul className="space-y-2">
              {messages.certificate.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm md:text-base opacity-80"
                >
                  <span className="text-[#072a6b] mt-0.5">✦</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !isSubmitting && setShowForm(false)}
        >
          <div
            className={`w-full max-w-md p-6 md:p-8 rounded-sm shadow-2xl ${
              isDark ? "bg-[#1e1e1e] text-white" : "bg-white text-black"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl uppercase tracking-tight">
                {messages.certificate.formTitle}
              </h3>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowForm(false)}
                className="text-2xl opacity-60 hover:opacity-100 cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="text-sm opacity-70 mb-6">
              {messages.certificate.formSubtitle(
                isEuro
                  ? formatCertificateAmount(selectedTier.eur, "EUR")
                  : formatCertificateAmount(selectedTier.uah, "UAH")
              )}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm uppercase tracking-wide mb-1.5">
                  {messages.certificate.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={messages.certificate.namePlaceholder}
                  className={`w-full px-4 py-3 border text-base focus:outline-none focus:ring-2 focus:ring-[#072a6b] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-white"
                      : "bg-white border-stone-300 text-black"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wide mb-1.5">
                  {messages.certificate.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={messages.certificate.phonePlaceholder}
                  className={`w-full px-4 py-3 border text-base focus:outline-none focus:ring-2 focus:ring-[#072a6b] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-white"
                      : "bg-white border-stone-300 text-black"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wide mb-1.5">
                  {messages.certificate.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={messages.certificate.emailPlaceholder}
                  className={`w-full px-4 py-3 border text-base focus:outline-none focus:ring-2 focus:ring-[#072a6b] ${
                    isDark
                      ? "bg-stone-900 border-stone-700 text-white"
                      : "bg-white border-stone-300 text-black"
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 mt-2 text-base uppercase tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-white text-black hover:bg-stone-200"
                    : "bg-black text-white hover:bg-stone-800"
                }`}
              >
                {isSubmitting
                  ? messages.certificate.submitting
                  : messages.certificate.submitButton}
              </button>
            </form>
          </div>
        </div>
      )}

      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          isVisible={!!alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </section>
  );
}
