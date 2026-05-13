import { useState } from 'react';
import { X, CreditCard, Banknote, ShieldCheck, Loader2, CheckCircle2, Lock, Activity } from 'lucide-react';
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
      toast.success('Transaction confirmed via COD Protocol. 🚚');
      onSuccess('cod');
      onClose();
    } catch (err) {
      console.error('COD error:', err);
      setError('Neural link failure: Could not confirm COD protocol.');
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
        description: orderData.orderType === 'ORDER' ? 'Product Deployment' : 'Service Manifest',
        image: 'https://photowala.in/logo.png',
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
            toast.success('Settlement verified! 🎉');
            onSuccess('razorpay');
            onClose();
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            toast.error('Cryptographic verification failed.');
          }
        },
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
          contact: orderData.userPhone || '',
        },
        theme: { color: '#3b291f' },
        modal: {
          ondismiss: () => {
            setLoading(null);
            toast('Payment protocol aborted', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => {
        setError(`Secure link failure: ${res.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      setError('Could not initiate secure payment gateway.');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-deep/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(59,41,31,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-500 border border-brand-primary/5">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        <div className="p-12 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <Lock className="w-3.5 h-3.5 text-brand-secondary" />
                 <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em]">Secure Settlement Portal</span>
              </div>
              <h2 className="text-3xl font-bold text-brand-primary font-display tracking-tight leading-none">Choose Protocol</h2>
              <p className="text-brand-text/40 text-[11px] font-black uppercase tracking-widest mt-4">Authorized Action for Manifest #{orderData.orderId.slice(-8)}</p>
            </div>
            <button 
              onClick={onClose}
              disabled={!!loading}
              className="p-3 rounded-2xl bg-brand-surface border border-brand-primary/5 text-brand-primary/40 hover:text-brand-primary hover:rotate-90 transition-all duration-500 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Razorpay Option */}
            <button
              onClick={handleRazorpay}
              disabled={!!loading}
              className={`flex flex-col items-center gap-6 p-8 rounded-[2rem] border-2 transition-all duration-700 text-center group relative overflow-hidden
                ${loading === 'razorpay' ? 'border-brand-secondary bg-brand-secondary/5' : 'border-brand-primary/5 hover:border-brand-secondary hover:bg-brand-surface/50'}
                ${loading && loading !== 'razorpay' ? 'opacity-50 grayscale' : ''}`}
            >
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <CreditCard className="w-16 h-16" />
               </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${loading === 'razorpay' ? 'bg-brand-secondary text-white shadow-xl shadow-brand-secondary/30' : 'bg-brand-surface text-brand-primary border border-brand-primary/5 group-hover:bg-brand-secondary group-hover:text-white group-hover:shadow-xl group-hover:shadow-brand-secondary/30'}`}>
                {loading === 'razorpay' ? <Loader2 className="w-8 h-8 animate-spin" /> : <CreditCard className="w-8 h-8" />}
              </div>
              <div className="flex-1 relative z-10">
                <h3 className="font-bold text-brand-primary text-xl font-display tracking-tight">Gateway</h3>
                <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest mt-2">Digital Settlement</p>
                <div className="mt-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-brand-secondary/10 text-brand-secondary px-4 py-1.5 rounded-full border border-brand-secondary/10 group-hover:bg-brand-secondary group-hover:text-white transition-colors">Instant Sync</span>
                </div>
              </div>
            </button>

            {/* COD Option */}
            <button
              onClick={handleCOD}
              disabled={!!loading}
              className={`flex flex-col items-center gap-6 p-8 rounded-[2rem] border-2 transition-all duration-700 text-center group relative overflow-hidden
                ${loading === 'cod' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-primary/5 hover:border-brand-primary hover:bg-brand-surface/50'}
                ${loading && loading !== 'cod' ? 'opacity-50 grayscale' : ''}`}
            >
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <Banknote className="w-16 h-16" />
               </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${loading === 'cod' ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30' : 'bg-brand-surface text-brand-primary border border-brand-primary/5 group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-xl group-hover:shadow-brand-primary/30'}`}>
                {loading === 'cod' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Banknote className="w-8 h-8" />}
              </div>
              <div className="flex-1 relative z-10">
                <h3 className="font-bold text-brand-primary text-xl font-display tracking-tight">On-Arrival</h3>
                <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest mt-2">Offline Protocol</p>
                <div className="mt-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-brand-primary/5 text-brand-primary/40 px-4 py-1.5 rounded-full border border-brand-primary/10 group-hover:bg-brand-primary group-hover:text-white transition-colors">Zero Latency</span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-brand-primary/5 flex flex-col sm:flex-row items-center justify-center gap-8 text-brand-text/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-secondary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">SSL Encrypted Manifest</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Registry Node</span>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
               <Activity className="w-4 h-4" />
               {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
