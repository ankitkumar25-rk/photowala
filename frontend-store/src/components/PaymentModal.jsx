import { useState } from 'react';
import { X, CreditCard, Banknote, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, orderData, onSuccess }) {
  const [loading, setLoading] = useState(null); // 'cod' | 'razorpay' | null
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleCOD = async () => {
    setLoading('cod');
    setError(null);
    try {
      await api.post('/payments/cod', {
        internalOrderId: orderData.orderId,
        orderType: orderData.orderType,
      });
      toast.success('Order confirmed! Pay on delivery. 🚚');
      onSuccess('cod');
      onClose();
    } catch (err) {
      console.error('COD error:', err);
      setError('Could not confirm COD. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleRazorpay = async () => {
    setLoading('razorpay');
    setError(null);
    try {
      const { data } = await api.post('/payments/create-order', {
        amount: orderData.totalAmount, // Backend converts to paise
        currency: 'INR',
        orderId: orderData.orderId,
        orderType: orderData.orderType,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Photowala',
        description: orderData.orderType === 'ORDER' ? 'Product Order' : 'Service Order',
        image: 'https://photowala.in/logo.png', // Replace with actual logo URL
        order_id: data.razorpayOrderId,
        handler: async (paymentResponse) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              internalOrderId: orderData.orderId,
              orderType: orderData.orderType,
            });
            toast.success('Payment successful! 🎉');
            onSuccess('razorpay');
            onClose();
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            toast.error('Verification failed. Please contact support.');
          }
        },
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
          contact: orderData.userPhone || '',
        },
        theme: { color: '#b88a2f' },
        modal: {
          ondismiss: () => {
            setLoading(null);
            toast('Payment cancelled', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => {
        setError(`Payment failed: ${res.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      setError('Could not initiate payment. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#fdfaf7] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-soft/20 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl" />

        <div className="p-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#5b3f2f] font-serif tracking-tight">Choose Payment Method</h2>
              <p className="text-[#5b3f2f]/60 text-sm mt-1">Select how you'd like to pay for your order</p>
            </div>
            <button 
              onClick={onClose}
              disabled={!!loading}
              className="p-2 hover:bg-[#5b3f2f]/5 rounded-full transition-colors text-[#5b3f2f]/40 hover:text-[#5b3f2f]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Razorpay Option */}
            <button
              onClick={handleRazorpay}
              disabled={!!loading}
              className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 text-center group
                ${loading === 'razorpay' ? 'border-[#b88a2f] bg-[#b88a2f]/5 shadow-inner' : 'border-[#b88a2f]/20 hover:border-[#b88a2f] hover:bg-[#b88a2f]/5'}
                ${loading && loading !== 'razorpay' ? 'opacity-50 grayscale' : ''}`}
            >
              <div className={`p-4 rounded-2xl transition-colors duration-300 ${loading === 'razorpay' ? 'bg-[#b88a2f] text-white' : 'bg-[#b88a2f]/10 text-[#b88a2f] group-hover:bg-[#b88a2f] group-hover:text-white'}`}>
                {loading === 'razorpay' ? <Loader2 className="w-8 h-8 animate-spin" /> : <CreditCard className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#b88a2f] text-lg">Razorpay</h3>
                <p className="text-[10px] font-black text-[#b88a2f]/60 uppercase tracking-[0.1em] mt-1">UPI · Cards · Net Banking</p>
                <div className="mt-4">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Secure & Instant</span>
                </div>
              </div>
            </button>

            {/* COD Option */}
            <button
              onClick={handleCOD}
              disabled={!!loading}
              className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 text-center group
                ${loading === 'cod' ? 'border-green-500 bg-green-50/50 shadow-inner' : 'border-[#5b3f2f]/10 hover:border-[#5b3f2f] hover:bg-[#5b3f2f]/5'}
                ${loading && loading !== 'cod' ? 'opacity-50 grayscale' : ''}`}
            >
              <div className={`p-4 rounded-2xl transition-colors duration-300 ${loading === 'cod' ? 'bg-green-500 text-white' : 'bg-[#5b3f2f]/5 text-[#5b3f2f] group-hover:bg-[#5b3f2f] group-hover:text-white'}`}>
                {loading === 'cod' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Banknote className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#5b3f2f] text-lg">Cash on Delivery</h3>
                <p className="text-[10px] font-black text-[#5b3f2f]/60 uppercase tracking-[0.1em] mt-1">Pay when your order arrives</p>
                <div className="mt-4">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 px-3 py-1 rounded-full">No Extra Charges</span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-[#5b3f2f]/5 flex items-center justify-center gap-4 text-[#5b3f2f]/40">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Verified Merchant</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
