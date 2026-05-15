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
        name: 'Photowala Admin',
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

     <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#fdfaf7] w-full h-full sm:h-auto sm:max-w-lg sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 sm:duration-300 luxury-grain">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#b88a2f]/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#5b3f2f]/5 rounded-full -ml-24 -mb-24 blur-3xl" />

        <div className="p-6 sm:p-10 relative h-full flex flex-col justify-center sm:justify-start">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-[10px] font-black text-[#b88a2f] uppercase tracking-[0.2em] mb-2">Checkout Process</p>
              <h2 className="text-3xl font-bold text-[#5b3f2f] tracking-tight leading-tight">Payment Method</h2>
              <p className="text-[#7a655c] text-sm mt-2 font-medium opacity-80">Select the preferred transaction gateway for this order.</p>
            </div>
            <button 
              onClick={onClose}
              disabled={!!loading}
              className="p-2.5 bg-[#5b3f2f]/5 hover:bg-[#5b3f2f]/10 rounded-2xl transition-all text-[#5b3f2f]/60 active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-5">
            {/* Razorpay Option */}
            <button
              onClick={handleRazorpay}
              disabled={!!loading}
              className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all duration-300 text-left group
                ${loading === 'razorpay' ? 'border-[#b88a2f] bg-[#b88a2f]/5 shadow-inner' : 'border-[#5b3f2f]/5 hover:border-[#b88a2f]/40 hover:bg-white'}
                ${loading && loading !== 'razorpay' ? 'opacity-50 grayscale pointer-events-none' : ''}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${loading === 'razorpay' ? 'bg-[#b88a2f] text-white scale-110' : 'bg-[#f5e7d8] text-[#b88a2f] group-hover:bg-[#b88a2f] group-hover:text-white'}`}>
                {loading === 'razorpay' ? <Loader2 className="w-8 h-8 animate-spin" /> : <CreditCard className="w-8 h-8" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#5b3f2f] text-lg">Razorpay Secure</h3>
                <p className="text-[10px] font-black text-[#b88a2f] uppercase tracking-widest mt-1">UPI · Cards · Net Banking</p>
                <div className="mt-3 flex gap-2">
                   <span className="text-[9px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">Instant Settlement</span>
                </div>
              </div>
            </button>

            {/* COD Option */}
            <button
              onClick={handleCOD}
              disabled={!!loading}
              className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all duration-300 text-left group
                ${loading === 'cod' ? 'border-[#5b3f2f] bg-[#5b3f2f]/5 shadow-inner' : 'border-[#5b3f2f]/5 hover:border-[#5b3f2f]/40 hover:bg-white'}
                ${loading && loading !== 'cod' ? 'opacity-50 grayscale pointer-events-none' : ''}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${loading === 'cod' ? 'bg-[#5b3f2f] text-white scale-110' : 'bg-[#f5e7d8] text-[#5b3f2f] group-hover:bg-[#5b3f2f] group-hover:text-white'}`}>
                {loading === 'cod' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Banknote className="w-8 h-8" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#5b3f2f] text-lg">Cash on Delivery</h3>
                <p className="text-[10px] font-black text-[#7a655c] uppercase tracking-widest mt-1">Direct payment upon arrival</p>
                <div className="mt-3 flex gap-2">
                   <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Verified Address Req.</span>
                </div>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              {error}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-[#5b3f2f]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[#5b3f2f]/40">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SSL Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-[#b88a2f] uppercase tracking-widest">Photowala Gift</p>
          </div>
        </div>
      </div>
    </div>
  );
}
