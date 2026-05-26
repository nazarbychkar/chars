"use client";

import Image from "next/image";
import { Marck_Script } from "next/font/google";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { PREVIEW_GIFT_CERTIFICATE_CODE } from "@/lib/giftCertificateCode";
import type { CertificateTier } from "@/lib/certificates";
import { formatCertificateAmount } from "@/lib/certificates";
import { certificateGraphite as g } from "@/lib/certificateStyle";
import { siteContact } from "@/lib/siteContact";
import CertificateButterflyIcon from "./CertificateButterflyIcon";

const certScript = Marck_Script({
  weight: "400",
  subsets: ["latin", "cyrillic"],
});

interface CertificatePreviewProps {
  tier: CertificateTier;
  currency: "UAH" | "EUR";
}

export default function CertificatePreview({
  tier,
  currency,
}: CertificatePreviewProps) {
  const { messages } = useI18n();
  const isEuro = currency === "EUR";
  const formattedAmount = formatCertificateAmount(
    isEuro ? tier.eur : tier.uah,
    currency
  );

  return (
    <div
      className="relative w-full max-w-[560px] min-h-[640px] sm:min-h-[720px] aspect-[3/4] mx-auto overflow-hidden"
      style={{ backgroundColor: g.background }}
    >
      <div className="relative z-10 flex flex-col h-full px-8 sm:px-12 py-12 sm:py-14">
        <div className="flex justify-center pt-2 pb-8 sm:pb-12">
          <Image
            src="/images/dark-theme/chars-logo-header-dark.png"
            alt="CHARS"
            width={180}
            height={52}
            className="h-10 sm:h-11 w-auto object-contain"
            priority
          />
        </div>

        <div
          className={`flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 ${certScript.className}`}
          style={{ fontStyle: "italic" }}
        >
          <p
            className="text-[2.35rem] sm:text-[2.85rem] md:text-[3.1rem] leading-[1.3] max-w-[400px] -skew-x-1"
            style={{ color: g.script }}
          >
            {messages.certificate.title}
          </p>

          <p
            className="text-[1.9rem] sm:text-[2.35rem] md:text-[2.6rem] leading-[1.45] mt-8 sm:mt-10 max-w-[420px] -skew-x-1"
            style={{ color: g.script }}
          >
            {messages.certificate.amountPrefix}{" "}
            <span
              className="inline-block min-w-[140px] sm:min-w-[180px] border-b border-[#8a8680] pb-0.5"
              style={{ color: g.scriptSoft }}
            >
              {formattedAmount}
            </span>
          </p>

          <p
            className="text-[1.75rem] sm:text-[2.1rem] md:text-[2.45rem] leading-[1.4] mt-10 sm:mt-12 max-w-[360px] -skew-x-1"
            style={{ color: g.script }}
          >
            {messages.certificate.previewTagline}
          </p>
        </div>

        <div
          className="flex justify-between items-end gap-6 pt-8 font-['Inter'] not-italic font-normal uppercase tracking-[0.12em] text-[10px] sm:text-[11px]"
          style={{ color: g.footer }}
        >
          <div className="flex flex-col gap-1.5 text-left max-w-[62%]">
            <span>{messages.certificate.previewValid}</span>
            <span className="normal-case tracking-[0.04em]">
              {messages.certificate.previewCodeLabel}: {PREVIEW_GIFT_CERTIFICATE_CODE}
            </span>
            <span className="normal-case tracking-[0.04em] leading-snug">
              {siteContact.showroomAddress}
            </span>
          </div>
          <div className="flex flex-col items-end shrink-0 gap-2">
            <CertificateButterflyIcon size={34} className="opacity-95" />
            <span className="normal-case tracking-[0.06em] lowercase">
              charsua.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
