import Image from "next/image";

type CertificateBowTieIconProps = {
  className?: string;
  size?: number;
};

/** CHARS bow-tie brand mark — above charsua.com */
export default function CertificateButterflyIcon({
  className = "",
  size = 32,
}: CertificateBowTieIconProps) {
  return (
    <Image
      src="/images/CHARS-06.png"
      alt=""
      width={size}
      height={size}
      className={`object-contain ${className}`}
      aria-hidden
    />
  );
}
