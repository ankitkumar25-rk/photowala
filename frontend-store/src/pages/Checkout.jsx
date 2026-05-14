import { useState, useEffect, useCallback, createElement } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Plus, Check, Truck, Package,
  ShoppingBag, ArrowLeft, X, ChevronDown, ChevronUp, ChevronRight,
  Shield, Tag, Info, CreditCard, Banknote
} from 'lucide-react';
import { 
  MdSecurity, MdLocalShipping, MdAssignmentReturn 
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useCartStore } from '../store';
import { usersApi, ordersApi, paymentsApi } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store';
import { loadRazorpayScript } from '../utils/razorpay';

/* -- Mini address form modal -- */
function QuickAddressModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    label: 'Home', fullName: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b-2 border-cream-200">
          <div>
            <h3 className="font-bold text-2xl text-brand-primary">
              Add Delivery <span className="text-brand-secondary">Address</span>
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={submit} className="p-8 space-y-6">
          {/* Address type tabs */}
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((l) => (
              <button key={l} type="button"
                onClick={() => setForm((f) => ({ ...f, label: l }))}
                className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  form.label === l ? 'bg-brand-primary text-white shadow-md' : 'bg-cream-100 text-gray-700 hover:bg-cream-200'
                }`}
              >{l}</button>
            ))}
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handle} required className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone *</label>
              <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setForm(f => ({ ...f, phone: val }));
                }} 
                required 
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors" 
                placeholder="10-digit mobile number" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address Line 1 *</label>
            <input name="line1" value={form.line1} onChange={handle} required className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors" placeholder="House/Flat No., Street" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address Line 2</label>
            <input name="line2" value={form.line2} onChange={handle} className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors" placeholder="Area, Landmark (optional)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City *</label>
              <input name="city" value={form.city} onChange={handle} required className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors" placeholder="Mumbai" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">State *</label>
              <select name="state" value={form.state} onChange={handle} required className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors">
                <option value="">Select State</option>
                {[
                  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
                  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
                  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
                  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
                  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
                  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
                ].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Pincode *</label>
              <input 
                type="text" 
                name="pincode" 
                value={form.pincode} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setForm(f => ({ ...f, pincode: val }));
                }} 
                required 
                pattern="[0-9]{6}"
                className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors" 
                placeholder="6 digits" 
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream-50 cursor-pointer transition-colors">
            <input type="checkbox" checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="w-5 h-5 accent-brand-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-6 border-t border-cream-200">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 rounded-2xl border-2 border-cream-300 text-gray-700 font-bold hover:bg-cream-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-2xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors">
              {saving ? 'Saving...' : 'Save & Use'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -- Steps -- */
const STEPS = [
  { id: 1, label: 'Address' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Payment' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const items     = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep]               = useState(1);
  const [addresses, setAddresses]     = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [notes, setNotes]             = useState('');
  const [placing, setPlacing]         = useState(false);
  const [showItems, setShowItems]     = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);

  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  // const shipping = subtotal >= 1000 ? 0 : 49;
  const shipping = 0; // Temporarily disabled for live payment testing
  const total    = subtotal + shipping;

  const loadAddresses = useCallback(async () => {
    try {
      const { data } = await usersApi.getAddresses();
      setAddresses(data.data);
      const def = data.data.find((a) => a.isDefault) || data.data[0];
      if (def && !selectedAddr) setSelectedAddr(def.id);
    } catch (err) {
      toast.error('Failed to load addresses');
    }
  }, [selectedAddr]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  useEffect(() => {
    if (items.length === 0 && step !== 3) navigate('/cart');
  }, [items, step, navigate]);

  const addAddress = async (form) => {
    try {
      const { data } = await usersApi.addAddress(form);
      await loadAddresses();
      setSelectedAddr(data.data.id);
      setShowAddrModal(false);
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
      throw err;
    }
  };

  const handleCreateOrder = async (method) => {
    if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);

    try {
      const { data: orderRes } = await ordersApi.create({ addressId: selectedAddr, notes });
      const order = orderRes.data;

      if (method === 'COD') {
        await paymentsApi.confirmCOD({ internalOrderId: order.id, orderType: 'ORDER' });
        toast.success('Order placed successfully via COD!');
        handlePaymentSuccess('COD', order.id);
      } else {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Failed to load payment gateway. Please check your connection.');
          return;
        }

        const { data: responseBody } = await paymentsApi.createOrder({
          amount: total, currency: 'INR', orderId: order.id, orderType: 'ORDER',
        });
        const rzpData = responseBody.data;

        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Photowala',
          description: 'Product Order Checkout',
          order_id: rzpData.razorpayOrderId,
          handler: async (resp) => {
            try {
              await paymentsApi.verifyPayment({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                internalOrderId: order.id,
                orderType: 'ORDER',
              });
              toast.success('Payment successful!');
              handlePaymentSuccess('RAZORPAY', order.id);
            } catch (vErr) {
              toast.error('Verification failed. Contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#b88a2f' },
          modal: { ondismiss: () => setPlacing(false) },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentSuccess = async (method, orderId) => {
    await clearCart();
    await fetchCart();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    navigate(`/orders/${orderId}`);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddr);

  return (
    <div className="min-h-screen bg-cream-100 luxury-grain pt-32 pb-24 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/cart" className="hover:text-brand-secondary transition-colors">Cart</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-brand-primary">Checkout</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-8 sm:mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
              Secure <br />
              <span className="text-brand-secondary">Checkout</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-brand-secondary" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Step {step} of 3</p>
            </div>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-12 p-6 card flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s.id
                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                    : step > s.id
                    ? 'bg-brand-secondary text-white'
                    : 'bg-cream-200 text-gray-400'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className="font-bold text-[10px] sm:text-sm text-gray-700 hidden xs:inline uppercase tracking-widest">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > s.id ? 'bg-brand-secondary' : 'bg-cream-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ✅ Grid layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ✅ Left column - Steps (Takes more space) */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

            {/* STEP 1 — Address */}
            <div className={`card p-8 transition-all ${step >= 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-cream-200 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-surface flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                </div>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wider">
                    Change
                  </button>
                )}
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-linear-to-br from-brand-surface to-cream-50 border-2 border-dashed border-cream-300">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <MapPin className="w-6 h-6 text-brand-primary" />
                      </div>
                      <p className="text-gray-700 text-sm font-semibold mb-1">No Saved Addresses Yet</p>
                      <p className="text-gray-500 text-xs mb-6">Add a delivery address to continue with checkout</p>
                      <button onClick={() => setShowAddrModal(true)} className="btn-primary mx-auto inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Delivery Address</p>
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all group ${
                            selectedAddr === a.id
                              ? 'border-brand-secondary bg-linear-to-r from-brand-surface to-transparent shadow-md'
                              : 'border-cream-300 hover:border-brand-secondary hover:bg-cream-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={a.id}
                            checked={selectedAddr === a.id}
                            onChange={() => setSelectedAddr(a.id)}
                            className="mt-0.5 accent-brand-primary w-5 h-5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-900">{a.label}</span>
                              {a.isDefault && (
                                <span className="badge-featured text-[11px] px-2 py-1">Default</span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{a.fullName}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {a.line1}{a.line2 ? `, ${a.line2}` : ''}
                            </p>
                            <p className="text-sm text-gray-600">
                              {a.city}, {a.state} – {a.pincode}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">{a.phone}</p>
                          </div>
                          {selectedAddr === a.id && (
                            <div className="shrink-0 mt-1">
                              <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center shadow-sm">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </label>
                      ))}

                      {/* Add New Address Button */}
                      <button
                        onClick={() => setShowAddrModal(true)}
                        className="w-full py-4 border-2 border-dashed border-cream-400 rounded-2xl text-sm font-bold text-brand-primary hover:border-brand-secondary hover:bg-brand-surface transition-all flex items-center justify-center gap-3 group mt-2"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </div>
                        Add New Delivery Address
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-0.5 bg-linear-to-r from-cream-300 to-transparent" />
                    <span className="text-xs text-gray-400 font-semibold uppercase">Additional Info</span>
                    <div className="flex-1 h-0.5 bg-linear-to-l from-cream-300 to-transparent" />
                  </div>

                  {/* Order Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                      <span>Special Instructions</span>
                      <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-cream-200 focus:border-brand-secondary focus:outline-none transition-colors resize-none placeholder-gray-400"
                      placeholder="Add any special instructions or delivery notes (e.g., please ring doorbell twice, leave with security guard, etc.)"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => navigate('/cart')}
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-cream-300 text-gray-700 font-bold hover:bg-cream-50 transition-colors"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
                        setStep(2);
                      }}
                      className="flex-1 px-6 py-4 rounded-2xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors shadow-md"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {step > 1 && selectedAddress && (
                <div className="p-4 bg-brand-surface rounded-2xl">
                  <p className="text-sm font-semibold text-gray-900">{selectedAddress.label} — {selectedAddress.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} – {selectedAddress.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* STEP 2 — Review */}
            {step >= 2 && (
              <div className="card p-8">
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-cream-200 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand-surface flex items-center justify-center">
                      <Package className="w-5 h-5 text-brand-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Review Items</h2>
                  </div>
                  {step > 2 && (
                    <button onClick={() => setStep(2)} className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wider">
                      Change
                    </button>
                  )}
                </div>

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="divide-y divide-cream-100">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 shrink-0">
                            {item.product?.images?.[0]?.url ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-cream-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-1">{item.product?.name}</p>
                            <div className="flex items-center gap-2 mb-2">
                              {item.product?.unit && <span className="text-[10px] font-bold text-gray-400 uppercase bg-cream-100 px-1.5 py-0.5 rounded-md">{item.product.unit}</span>}
                              <span className="text-xs font-medium text-gray-500">Qty: <span className="font-bold text-gray-900">{item.quantity}</span></span>
                            </div>
                            <p className="font-bold text-base text-brand-primary">
                              ₹{(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="group relative w-full bg-brand-primary text-white py-4 sm:py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all flex items-center justify-center gap-3 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span>Continue to Payment</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {step > 2 && (
                  <div className="p-4 bg-brand-surface rounded-2xl text-sm text-gray-600">
                    {items.length} item{items.length !== 1 ? 's' : ''} reviewed
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Payment */}
            {step >= 3 && (
              <div className="card p-8">
                <div className="flex items-center gap-4 pb-6 border-b border-cream-200 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-brand-surface flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-gray-600 text-center max-w-sm mx-auto">
                    Choose your preferred payment method to complete your purchase securely.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Pay Online */}
                    <button
                      onClick={() => handleCreateOrder('RAZORPAY')}
                      disabled={placing}
                      className="group flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-[#b88a2f]/20 hover:border-[#b88a2f] hover:bg-[#b88a2f]/5 transition-all duration-300 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#b88a2f]/10 text-[#b88a2f] flex items-center justify-center group-hover:bg-[#b88a2f] group-hover:text-white transition-all duration-300">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#5b3f2f]">Pay Online</h4>
                        <p className="text-[10px] text-[#5b3f2f]/60 uppercase tracking-widest font-black mt-1">UPI · Cards · Wallets</p>
                      </div>
                      <div className="mt-auto pt-4">
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Secure Checkout</span>
                      </div>
                    </button>

                    {/* COD */}
                    <button
                      onClick={() => handleCreateOrder('COD')}
                      disabled={placing}
                      className="group flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                        <Banknote className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Cash on Delivery</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Pay at your doorstep</p>
                      </div>
                      <div className="mt-auto pt-4">
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">No extra charges</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Payment</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Fast Shipping</span>
                  </div>
                </div>
              </div>
            )}

          </div> {/* ✅ closes left column (lg:col-span-1) */}

          {/* ✅ Right column — Order Summary (Stickier & Slimmer) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="card sticky top-24">
              <button
                onClick={() => setShowItems(!showItems)}
                className="w-full flex items-center justify-between p-4 border-b border-cream-200 lg:cursor-default"
              >
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-primary" />
                  Order Summary
                  <span className="badge-featured">{items.length}</span>
                </h2>
                <span className="lg:hidden text-gray-400">
                  {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {/* Items list */}
              <div className={`overflow-hidden transition-all ${showItems ? 'max-h-96' : 'max-h-0 lg:max-h-none'}`}>
                <div className="p-4 divide-y divide-cream-200 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                      <div className="relative shrink-0">
                        <img
                          src={item.product?.images?.[0]?.url || 'https://placehold.co/48x48/d8f3dc/2d6a4f?text=??'}
                          alt={item.product?.name}
                          className="w-12 h-12 rounded-xl object-cover bg-cream-100"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{item.product?.name}</p>
                        {item.product?.unit && <p className="text-[10px] text-gray-400">{item.product.unit}</p>}
                      </div>
                      <p className="font-bold text-gray-900 text-sm shrink-0">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Shipping
                  </span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{shipping.toFixed(2)}</span>
                  )}
                </div>

                {shipping > 0 && (
                  <div className="bg-brand-surface p-2.5 rounded-xl text-xs text-brand-secondary font-medium flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Add ₹{(1000 - subtotal).toFixed(2)} more to get free shipping!
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-3 border-t border-cream-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-primary">₹{total.toFixed(2)}</span>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Including all taxes • Prices in INR
                </div>
              </div>

              {/* Trust badges */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {[
                  { icon: <MdSecurity className="w-5 h-5 text-brand-primary" />, label: 'Secure\nPayment' },
                  { icon: <MdLocalShipping className="w-5 h-5 text-brand-primary" />, label: 'Fast\nDelivery' },
                  { icon: <MdAssignmentReturn className="w-5 h-5 text-brand-primary" />, label: 'Easy\nReturns' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-2 bg-cream-50 rounded-xl">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm">{icon}</div>
                    <p className="text-[9px] text-gray-500 font-medium text-center leading-tight whitespace-pre-line">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div> {/* ✅ closes right column (lg:col-span-2) */}

        </div> {/* ✅ closes grid */}
      </div> {/* ✅ closes max-w-6xl */}

      {showAddrModal && (
        <QuickAddressModal onClose={() => setShowAddrModal(false)} onSave={addAddress} />
      )}
    </div> // ✅ closes min-h-screen
  );
}