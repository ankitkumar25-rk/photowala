import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CostSummary from '../../../../components/OrderForm/CostSummary';
import FileUploadOption from '../../../../components/OrderForm/FileUploadOption';
import DiscountBadge from '../../../../components/OrderForm/DiscountBadge';
import { penOrdersApi } from '../../../../api';

const penTypes = [
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

const qtyOptions = [1, 2, 5, 10, 20, 30, 40, 50, 75, 100];

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
  const [orderName, setOrderName] = useState('');
  const [selectedPenType, setPenType] = useState('');
  const [qty, setQty] = useState(1);
  const [deliveryOption] = useState('courier');
  const [fileOption, setFileOption] = useState('attach');
  const [attachedFile, setFile] = useState(null);
  const [emailForFile, setEmailForFile] = useState('');
  const [specialRemark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedType = penTypes.find((p) => p.id === selectedPenType);
  const discountPercent = getDiscountPercent(qty || 1);

  const pricing = useMemo(() => {
    const applicableCost = (selectedType?.basePrice || 0) * (qty || 0);
    const discountAmt = applicableCost * (discountPercent / 100);
    const discountedCost = applicableCost - discountAmt;
    const emailCharge = fileOption === 'email' ? 10 : 0;
    const gst = (discountedCost + emailCharge) * 0.18;
    const totalPayable = discountedCost + emailCharge + gst;
    return { applicableCost, discountAmt, emailCharge, gst, totalPayable, discountPercent };
  }, [selectedType, qty, fileOption, discountPercent]);

  const isValid = orderName.trim().length >= 3
    && selectedPenType
    && qty
    && (fileOption === 'attach' ? !!attachedFile : /^\S+@\S+\.\S+$/.test(emailForFile));

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const { data } = await penOrdersApi.createLaserPrintedPenOrder({
        orderName,
        penType: selectedPenType,
        qty,
        deliveryOption,
        fileOption,
        emailForFile: fileOption === 'email' ? emailForFile : undefined,
        specialRemark: specialRemark || undefined,
        pricing,
      });
      toast.success(`Order created: ${data.orderId}`);
      setOrderName('');
      setPenType('');
      setQty(1);
      setFileOption('attach');
      setFile(null);
      setEmailForFile('');
      setRemark('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs text-gray-500">
          Home → Our Services → Custom Printing → Pen → Laser Printed Pen
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-5">
          <aside className="card p-5 lg:col-span-2">
            <div className="grid grid-cols-2 gap-2">
              {['/pen1.jpg', '/pen2.jpg', '/pen3.jpg', '/pen4.jpg'].map((img, i) => (
                <div key={img} className="h-24 rounded bg-cream-200 text-xs text-gray-500 flex items-center justify-center">
                  Sample {i + 1}
                </div>
              ))}
            </div>
            <h1 className="mt-5 text-2xl font-bold text-[#C8622A]" style={{ fontFamily: 'Fraunces, serif' }}>
              LASER PRINTED PEN
            </h1>
            <p className="text-sm text-gray-500">Production Time: 5 days</p>
            <p className="mt-4 text-sm text-gray-700">
              Personalize any pen with precision laser engraving - your name, logo, or message etched permanently.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>🎯 Precision Laser Engraving</p>
              <p>✅ GST Invoice Provided</p>
              <p>🚚 Free Courier Delivery</p>
            </div>
          </aside>

          <form onSubmit={submit} className="card space-y-4 p-5 lg:col-span-3">
            <label className="block text-sm font-semibold">
              1. Order Name
              <input className="input-field mt-1" value={orderName} onChange={(e) => setOrderName(e.target.value)} placeholder="यहाँ अपने कस्टमर का नाम टाइप करें..." required />
            </label>

            <label className="block text-sm font-semibold">
              2. Select Product
              <select className="input-field mt-1 bg-gray-100" disabled value="Laser Printed Pens">
                <option>Laser Printed Pens</option>
              </select>
            </label>

            <div className="rounded-2xl border border-cream-300 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-800">3. Select Detail</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  🏷 Pen Type
                  <select className="input-field mt-1" value={selectedPenType} onChange={(e) => setPenType(e.target.value)} required>
                    <option value="">Select pen type</option>
                    {penTypes.map((p) => (
                      <option key={p.id} value={p.id} title={`${p.name} - ₹${p.basePrice}`}>
                        {p.id} - {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  🏷 Qty.
                  <select className="input-field mt-1" value={qty} onChange={(e) => setQty(Number(e.target.value))} required>
                    {qtyOptions.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-3"><DiscountBadge discountPercent={discountPercent} /></div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">4. Select Delivery Option</p>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="radio" checked readOnly className="accent-brand-primary" />
                🚚 Deliver By Courier - Free Delivery
              </label>
            </div>

            <FileUploadOption
              fileOption={fileOption}
              setFileOption={setFileOption}
              attachedFile={attachedFile}
              setFile={setFile}
              emailForFile={emailForFile}
              setEmailForFile={setEmailForFile}
            />

            <CostSummary
              applicableCost={pricing.applicableCost}
              discountPercent={pricing.discountPercent}
              discountAmt={pricing.discountAmt}
              gst={pricing.gst}
              emailCharge={pricing.emailCharge}
              totalPayable={pricing.totalPayable}
            />

            <label className="block text-sm font-semibold">
              6. Special Remark (Optional)
              <textarea
                className="input-field mt-1 min-h-24"
                maxLength={300}
                value={specialRemark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="remarks for order processing team..."
              />
              <span className="mt-1 block text-right text-xs text-gray-500">{specialRemark.length}/300</span>
            </label>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full rounded-xl bg-[#C8622A] py-3 text-sm font-bold text-white transition hover:scale-[1.01] hover:bg-[#A04E20] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Add Order (Pay From Wallet)'}
            </button>
            <Link to="/services/custom-printing/pen" className="block text-center text-xs text-gray-500 hover:underline">Back to Pen</Link>
          </form>
        </div>
      </div>
    </div>
  );
}
