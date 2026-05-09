import React from 'react';
import { CheckCircle, Calendar, Package, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderSuccessModal({ order, onClose }) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="relative p-8 md:p-12 text-center">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Order Placed Successfully!</h2>
                    <p className="text-gray-500 text-sm font-medium mb-8 uppercase tracking-widest text-[10px]">Your order #{order.orderNumber} is confirmed</p>

                    <div className="space-y-4 text-left mb-8">
                        <div className="bg-[#fffaf5] border border-[#e8dfd5] rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#e8dfd5]/50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to Pay (COD)</span>
                                <span className="text-xl font-black text-[#b65e2e]">₹{order.totalAmount}</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                    <Calendar className="w-4 h-4 text-[#b65e2e]/50" />
                                    <span>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                    <Package className="w-4 h-4 text-[#b65e2e]/50" />
                                    <span>Payment Method: Cash on Delivery</span>
                                </div>
                            </div>
                        </div>

                        {order.emailInstruction && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 italic">Action Required:</p>
                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">{order.emailInstruction}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link 
                            to={`/orders/track/${order.orderNumber}`}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 group"
                        >
                            Track Your Order
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                        >
                            Return to Service
                        </button>
                    </div>
                </div>
                
                <div className="bg-gray-50 py-4 px-8 text-center border-t border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Thank you for choosing Photowala</p>
                </div>
            </div>
        </div>
    );
}
