export default function CostSummary({
  applicableCost,
  discountPercent,
  discountAmt,
  gst,
  emailCharge,
  totalPayable,
}) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm">
      <div className="flex justify-between py-1"><span>Applicable Cost</span><span>₹ {applicableCost.toFixed(2)}</span></div>
      <div className="flex justify-between py-1 text-green-700"><span>Bulk Discount ({discountPercent}%)</span><span>- ₹ {discountAmt.toFixed(2)}</span></div>
      <div className="flex justify-between py-1"><span>GST (18.00%)</span><span>+ ₹ {gst.toFixed(2)}</span></div>
      <div className="flex justify-between py-1"><span>Email Surcharge</span><span>+ ₹ {emailCharge.toFixed(2)}</span></div>
      <div className="mt-2 border-t border-cream-300 pt-2 text-base font-bold">
        <div className="flex justify-between"><span>Amount Payable</span><span>₹ {totalPayable.toFixed(2)}</span></div>
      </div>
    </div>
  );
}
