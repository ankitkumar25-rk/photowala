import { useState, useEffect, useCallback, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Plus, Check, Truck, Package,
  ShoppingBag, ArrowLeft, X, ChevronDown, ChevronUp,
  Shield, Tag, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store';
import { usersApi, ordersApi } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store';
import PaymentModal from '../components/PaymentModal';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h3 className="font-bold text-xl text-gray-900">
            Add Delivery Address
          </h3>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((l) => (
              <button key={l} type="button"
                onClick={() => setForm((f) => ({ ...f, label: l }))}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                  form.label === l ? 'border-brand-secondary bg-brand-surface text-brand-primary' : 'border-cream-300 text-gray-500'
                }`}
              >{l}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handle} required className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Phone *</label>
              <input name="phone" value={form.phone} onChange={handle} required className="input-field" placeholder="9876543210" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address Line 1 *</label>
            <input name="line1" value={form.line1} onChange={handle} required className="input-field" placeholder="House/Flat No., Street" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address Line 2</label>
            <input name="line2" value={form.line2} onChange={handle} className="input-field" placeholder="Area, Landmark (optional)" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City *</label>
              <input name="city" value={form.city} onChange={handle} required className="input-field" placeholder="Mumbai" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">State *</label>
              <input name="state" value={form.state} onChange={handle} required className="input-field" placeholder="Maharashtra" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={handle} required maxLength={6} className="input-field" placeholder="400001" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="w-4 h-4 accent-brand-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
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
  const items        = useCartStore((s) => s.items);
  const fetchCart    = useCartStore((s) => s.fetchCart);
  const clearCart    = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping = subtotal >= 1000 ? 0 : 49;
  const total = subtotal + shipping;

  const loadAddresses = useCallback(async () => {
    try {
      const { data } = await usersApi.getAddresses();
      setAddresses(data.data);
      const def = data.data.find((a) => a.isDefault) || data.data[0];
      if (def && !selectedAddr) setSelectedAddr(def.id);
    } catch (err) {
      console.error('Failed to load addresses:', err);
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

  /* -- Step 1: Create Order In DB -- */
  const handleCreateOrder = async () => {
    if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);

    try {
      // Create order with PENDING status
      const { data: orderRes } = await ordersApi.create({ addressId: selectedAddr, notes });
      const order = orderRes.data;
      
      setCurrentOrderData({
        orderId: order.id,
        orderType: 'ORDER',
        totalAmount: total,
        userName: user?.name || 'Customer',
        userEmail: user?.email || '',
        userPhone: user?.phone || '',
      });
      
      setShowPaymentModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate order');
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentSuccess = async (method) => {
    await clearCart();
    await fetchCart();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    navigate(`/orders/${currentOrderData.orderId}`);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddr);

  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      {/* Header */}
      <div className="bg-white border-b border-cream-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  step === s.id
                    ? 'bg-brand-primary text-white'
                    : step > s.id
                    ? 'text-brand-primary'
                    : 'text-gray-400'
                }`}>
                  {step > s.id ? <Check className="w-3.5 h-3.5" /> : <span>{s.id}</span>}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${step > s.id ? 'bg-brand-secondary' : 'bg-cream-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* -- Left column (steps) -- */}
          <div className="lg:col-span-3 space-y-6">

            {/* STEP 1 â€” Address */}
            <div className={`card transition-all ${step >= 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center justify-between p-4 border-b border-cream-200">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step > 1 ? 'bg-brand-secondary text-white' : 'bg-brand-surface text-brand-primary'}`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  Delivery Address
                </h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-xs font-semibold text-brand-primary hover:text-brand-primary">
                    Change
                  </button>
                )}
              </div>

              {step === 1 && (
                <div className="p-4 space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <MapPin className="w-10 h-10 mx-auto mb-2 text-cream-50/80" />
                      <p className="text-gray-600 text-sm mb-3">No saved addresses. Add one to continue.</p>
                      <button onClick={() => setShowAddrModal(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Add Address
                      </button>
                    </div>
                  ) : (
                    <>
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedAddr === a.id
                              ? 'border-brand-secondary bg-brand-surface'
                              : 'border-cream-300 hover:border-brand-secondary'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={a.id}
                            checked={selectedAddr === a.id}
                            onChange={() => setSelectedAddr(a.id)}
                            className="mt-1 accent-brand-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm">{a.label} â€” {a.fullName}</span>
                              {a.isDefault && <span className="badge-featured text-[10px]">Default</span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} â€“ {a.pincode}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{a.phone}</p>
                          </div>
                          {selectedAddr === a.id && (
                            <Check className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                          )}
                        </label>
                      ))}
                      <button
                        onClick={() => setShowAddrModal(true)}
                        className="w-full py-3 border-2 border-dashed border-cream-300 rounded-2xl text-sm font-semibold text-brand-primary hover:border-brand-secondary hover:bg-brand-surface transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add New Address
                      </button>
                    </>
                  )}

                  {/* Notes */}
                  <div className="mt-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="input-field resize-none"
                      placeholder="Special instructions for your order..."
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!selectedAddr) { toast.error('Select an address first'); return; }
                      setStep(2);
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    Continue to Review ?
                  </button>
                </div>
              )}

              {step > 1 && selectedAddress && (
                <div className="p-4 bg-brand-surface">
                  <p className="text-sm font-semibold text-gray-900">{selectedAddress.label} â€” {selectedAddress.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} â€“ {selectedAddress.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* STEP 2 â€” Review */}
            {step >= 2 && (
              <div className="card">
                <div className="flex items-center justify-between p-4 border-b border-cream-200">
                  <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step > 2 ? 'bg-brand-secondary text-white' : 'bg-brand-surface text-brand-primary'}`}>
                      {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    Review Items
                  </h2>
                  {step > 2 && (
                    <button onClick={() => setStep(2)} className="text-xs font-semibold text-brand-primary">Change</button>
                  )}
                </div>
                {step === 2 && (
                  <div className="p-4">
                    <div className="divide-y divide-cream-200">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <img
                            src={item.product?.images?.[0]?.url || 'https://placehold.co/64x64/d8f3dc/2d6a4f?text=??'}
                            alt={item.product?.name}
                            className="w-14 h-14 rounded-xl object-cover bg-cream-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{item.product?.name}</p>
                            {item.product?.unit && <p className="text-xs text-gray-500">{item.product.unit}</p>}
                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900 shrink-0">?{(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="btn-primary w-full justify-center mt-4"
                    >
                      Continue to Payment ?
                    </button>
                  </div>
                )}
                {step > 2 && (
                  <div className="p-4 bg-brand-surface text-sm text-gray-600">
                    {items.length} item{items.length !== 1 ? 's' : ''} reviewed ?
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 â€” Payment */}
            {step >= 3 && (
              <div className="card">
                <div className="p-4 border-b border-cream-200">
                  <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center text-sm font-bold">3</div>
                    Payment Selection
                  </h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="p-6 rounded-2xl bg-cream-50 border-2 border-brand-secondary/20 flex flex-col items-center text-center">
                    <Shield className="w-12 h-12 text-brand-secondary mb-3" />
                    <h3 className="font-bold text-[#5b3f2f] text-lg">Secure Your Order</h3>
                    <p className="text-sm text-[#5b3f2f]/60 mt-1 max-w-xs">
                      Secure your order via <strong>Razorpay</strong> (UPI, Cards, Wallets) or <strong>Cash on Delivery</strong>.
                    </p>
                    <button
                      onClick={handleCreateOrder}
                      disabled={placing}
                      className="btn-primary w-full justify-center mt-6 py-4 text-lg shadow-xl shadow-brand-primary/20"
                    >
                      {placing ? 'Processing...' : `Complete Order â€¢ ?${total.toFixed(2)}`}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Checkout</span>
                    <span>â€¢</span>
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Fast Delivery</span>
                    <span>â€¢</span>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* -- Right column (order summary) -- */}
          <div className="lg:col-span-2">
            <div className="card sticky top-20">
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
                      <p className="font-bold text-gray-900 text-sm shrink-0">?{(Number(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">?{subtotal.toFixed(2)}</span>
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
                    <span className="font-semibold text-gray-900">?{shipping.toFixed(2)}</span>
                  )}
                </div>

                {shipping > 0 && (
                  <div className="bg-brand-surface p-2.5 rounded-xl text-xs text-brand-secondary font-medium flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Add ?{(1000 - subtotal).toFixed(2)} more to get free shipping!
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-3 border-t border-cream-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-primary">?{total.toFixed(2)}</span>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Including all taxes â€¢ Prices in INR
                </div>
              </div>

              {/* Trust badges */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                {[
                  { Icon: Shield, label: 'Secure\nPayment' },
                  { Icon: Truck, label: 'Fast\nDelivery' },
                  { Icon: Package, label: 'Easy\nReturns' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-2 bg-cream-50 rounded-xl">
                    {createElement(Icon, { className: 'w-5 h-5 text-brand-secondary' })}
                    <p className="text-[10px] text-gray-500 font-medium text-center leading-tight whitespace-pre-line">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddrModal && (
        <QuickAddressModal onClose={() => setShowAddrModal(false)} onSave={addAddress} />
      )}

      {showPaymentModal && currentOrderData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={currentOrderData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

