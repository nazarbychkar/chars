type CategoryDiscountBadgeProps = {
  discountPercentage?: number | null;
  className?: string;
  size?: "sm" | "md";
};

export default function CategoryDiscountBadge({
  discountPercentage,
  className = "",
  size = "sm",
}: CategoryDiscountBadgeProps) {
  const pct = Number(discountPercentage);
  if (!Number.isFinite(pct) || pct <= 0) return null;

  const sizeClass =
    size === "md"
      ? "text-[11px] sm:text-xs px-2 py-0.5 tracking-[0.14em]"
      : "text-[10px] sm:text-[11px] px-1.5 py-0.5 tracking-[0.12em]";

  return (
    <span
      className={`inline-flex items-center rounded-full border border-current/20 font-medium uppercase leading-none opacity-80 ${sizeClass} ${className}`}
      aria-label={`Знижка ${Math.round(pct)} відсотків`}
    >
      −{Math.round(pct)}%
    </span>
  );
}
