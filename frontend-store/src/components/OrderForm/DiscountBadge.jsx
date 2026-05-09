export default function DiscountBadge({ discountPercent }) {
  if (!discountPercent || discountPercent <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      🎉 {discountPercent}% OFF on bulk order!
    </span>
  );
}
