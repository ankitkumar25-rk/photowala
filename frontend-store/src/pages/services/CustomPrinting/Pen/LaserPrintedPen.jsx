import { useState } from 'react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PEN_TYPES = [
  { id: '101', name: 'Classic Ball Pen', basePrice: 25 },
  { id: '102', name: 'Gel Ink Pen', basePrice: 35 },
  { id: '103', name: 'Premium Metal Pen', basePrice: 75 },
  { id: '104', name: 'Executive Roller', basePrice: 95 },
  { id: '105', name: 'Slim Twist Pen', basePrice: 30 },
  { id: '106', name: 'Matte Finish Pen', basePrice: 40 },
  { id: '107', name: 'Two-Tone Pen', basePrice: 55 },
  { id: '108', name: 'Corporate Series', basePrice: 65 },
  { id: '109', name: 'Gift Box Pen', basePrice: 110 },
  { id: '110', name: 'Luxury Brass Pen', basePrice: 150 },
];

const QTY_OPTIONS = [1, 2, 5, 10, 20, 30, 40, 50, 75, 100];

const getDiscountPercent = (qty) => {
  if (qty >= 100) return 25;
  if (qty >= 75) return 22;
  if (qty >= 50) return 18;
  if (qty >= 40) return 15;
  if (qty >= 30) return 12;
  if (qty >= 20) return 10;
  if (qty >= 10) return 7;
  if (qty >= 5) return 4;
  if (qty >= 2) return 2;
  return 0;
};

export default function LaserPrintedPen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orderName: '',
    penType: '101',
    quantity: 1,
    deliveryOption: 'courier',
    fileOption: 'attach',
    fileEmail: '',
    remarks: '',
    file: null,
  });

  const penType = PEN_TYPES.find((p) => p.id === form.penType);
  const discountPercent = getDiscountPercent(form.quantity);
  const applicableCost = penType.basePrice * form.quantity;
  const discountAmt = applicableCost * (discountPercent / 100);
  const discountedCost = applicableCost - discountAmt;
  const emailCharge = form.fileOption === 'email' ? 10 : 0;
  const gst = (discountedCost + emailCharge) * 0.18;
  const totalPayable = discountedCost + emailCharge + gst;

  const isFormValid = form.orderName.trim() && (form.fileOption === 'attach' ? form.file : form.fileEmail);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Order submitted! Our team will contact you soon.');
    setForm({ orderName: '', penType: '101', quantity: 1, deliveryOption: 'courier', fileOption: 'attach', fileEmail: '', remarks: '', file: null });
  };

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Laser Printed Pen
          </h1>
          <p className="text-gray-600 mb-8">Customize premium pens with precision laser engraving</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. ORDER NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">1. ORDER NAME *</label>
              <input
                type="text"
                value={form.orderName}
                onChange={(e) => setForm({ ...form, orderName: e.target.value })}
                placeholder="Type your customer name here to make it easier to check the order status..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* 2. SELECT PRODUCT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">2. SELECT PRODUCT</label>
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed">
                Laser Printed Pens
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-selected — only available option</p>
            </div>

            {/* 3. SELECT DETAIL */}
            <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 bg-orange-50">
              <h3 className="font-semibold text-gray-900 mb-4">3. SELECT DETAIL</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Pen Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🏷 Pen Type</label>
                  <select
                    value={form.penType}
                    onChange={(e) => setForm({ ...form, penType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {PEN_TYPES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">₹{penType.basePrice} per unit</p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🏷 Qty.</label>
                  <select
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {QTY_OPTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q} {q === 1 ? 'piece' : 'pieces'}
                      </option>
                    ))}
                  </select>
                  {discountPercent > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">🎉 {discountPercent}% OFF on bulk order!</p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. SELECT DELIVERY OPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">4. SELECT DELIVERY OPTION</label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="delivery"
                  value="courier"
                  checked={form.deliveryOption === 'courier'}
                  onChange={(e) => setForm({ ...form, deliveryOption: e.target.value })}
                  className="accent-orange-600"
                />
                <span className="text-sm font-medium text-gray-700">🚚 Deliver By Courier — Free Delivery</span>
              </label>
            </div>

            {/* 5. SELECT FILE OPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">5. SELECT FILE OPTION</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="fileOption"
                    value="attach"
                    checked={form.fileOption === 'attach'}
                    onChange={(e) => setForm({ ...form, fileOption: e.target.value })}
                    className="accent-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">☁️ Attach File Online</span>
                </label>

                {form.fileOption === 'attach' && (
                  <div className="ml-6 p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                      accept=".cdr,.zip,.pdf,.ai,.psd"
                      className="w-full text-sm"
                    />
                    {form.file && <p className="text-xs text-gray-600 mt-2">Selected: {form.file.name}</p>}
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="fileOption"
                    value="email"
                    checked={form.fileOption === 'email'}
                    onChange={(e) => setForm({ ...form, fileOption: e.target.value })}
                    className="accent-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">✉️ Send via Email</span>
                </label>

                {form.fileOption === 'email' && (
                  <div className="ml-6 space-y-2">
                    <input
                      type="email"
                      value={form.fileEmail}
                      onChange={(e) => setForm({ ...form, fileEmail: e.target.value })}
                      placeholder="Send file to: email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                      <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <span className="text-xs text-amber-700">Extra Charges – ₹10.00 applicable</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COST SUMMARY */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">COST SUMMARY</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Applicable Cost</span>
                <span className="font-medium">₹{applicableCost.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bulk Discount ({discountPercent}%)</span>
                  <span className="font-medium">- ₹{discountAmt.toFixed(2)}</span>
                </div>
              )}
              {emailCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Email Surcharge</span>
                  <span className="font-medium">+ ₹{emailCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-gray-300 pt-2">
                <span className="text-gray-700">GST (18%)</span>
                <span className="font-medium">+ ₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
                <span>AMOUNT PAYABLE</span>
                <span className="text-orange-600">₹{totalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* 6. SPECIAL REMARK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">6. SPECIAL REMARK (Optional)</label>
              <textarea
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value.slice(0, 300) })}
                placeholder="Remarks for order processing team..."
                maxLength={300}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{form.remarks.length}/300 characters</p>
            </div>

            {/* 7. CTA BUTTON */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                isFormValid
                  ? 'bg-[#C8622A] hover:bg-[#A04E20] hover:scale-[1.01] cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Add Order (Pay From Wallet)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
