"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { CertificateTier } from "@/lib/certificates";
import { getCertificatePngPublicUrl } from "@/lib/certificateFileNames";

interface CertificatePreviewProps {
  tier: CertificateTier;
  currency: "UAH" | "EUR";
}

export default function CertificatePreview({
  tier,
}: CertificatePreviewProps) {
  const { messages } = useI18n();
  const imageSrc = getCertificatePngPublicUrl(tier.uah);

  if (!imageSrc) {
    return (
      <div className="w-full max-w-[560px] mx-auto p-8 text-center text-sm opacity-70">
        {messages.certificate.previewTagline}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      <Image
        src={imageSrc}
        alt={messages.certificate.title}
        width={560}
        height={720}
        className="w-full h-auto object-contain shadow-lg"
        priority
        sizes="(max-width: 560px) 100vw, 560px"
      />
    </div>
  );
}
