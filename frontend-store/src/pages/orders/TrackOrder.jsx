import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderTracking } from '../../services/customPrinting.api';
import { 
    Clock, Package, CheckCircle, Truck, Search, 
    ArrowLeft, Calendar, FileText, IndianRupee, ShieldCheck
} from 'lucide-react';

const STATUS_STEPS = [
    { id: 'PENDING', label: 'Order Placed', icon: Clock },
    { id: 'IN_PRODUCTION', label: 'In Production', icon: Package },
    { id: 'QUALITY_CHECK', label: 'Quality Check', icon: ShieldCheck },
    { id: 'DISPATCHED', label: 'Dispatched', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
];

export default function TrackOrder() {
    const { orderNumber } = useParams();
    const { data: result, isLoading, error } = useOrderTracking(orderNumber);
    const order = result?.data;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fffaf5]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#b65e2e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Searching for order...</p>
            </div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] p-4">
            <div className="max-w-md w-full bg-white rounded-[2rem] p-12 text-center shadow-xl shadow-[#b65e2e]/5">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Order Not Found</h1>
                <p className="text-gray-500 text-xs font-medium mb-8 leading-relaxed">We couldn't find any order with the number <span className="font-bold text-gray-900">{orderNumber}</span>. Please check for any typos or contact support.</p>
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-[#b65e2e] uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                    <ArrowLeft className="w-3 h-3" /> Back to Home
                </Link>
            </div>
        </div>
    );

    const currentStatusIndex = STATUS_STEPS.findIndex(step => step.id === order.status);
    // Since our DB statuses might differ slightly from visual steps, we map them
    // DB: PENDING, IN_PRODUCTION, DISPATCHED, DELIVERED, CANCELLED
    const getActiveIndex = () => {
        if (order.status === 'PENDING') return 0;
        if (order.status === 'IN_PRODUCTION') return 1;
        if (order.status === 'DISPATCHED') return 3;
        if (order.status === 'DELIVERED') return 4;
        return -1;
    };
    const activeIndex = getActiveIndex();

    return (
        <div className="min-h-screen bg-[#fffaf5] py-12 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#b65e2e] transition-colors mb-8">
                    <ArrowLeft className="w-3 h-3" /> Back to Store
                </Link>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-[#b65e2e]/5 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fffaf5] border border-[#e8dfd5] rounded-full text-[9px] font-black text-[#b65e2e] uppercase tracking-widest mb-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b65e2e] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b65e2e]"></span>
                                </span>
                                Live Order Tracking
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{order.orderNumber}</h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{order.serviceType.replace('_', ' ')} • {order.orderName}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                            <div className="flex items-center md:justify-end gap-2 text-lg font-black text-gray-900">
                                <Calendar className="w-5 h-5 text-[#b65e2e]" />
                                {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="p-8 md:p-16">
                        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-1000" 
                                    style={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                ></div>
                            </div>

                            {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx <= activeIndex;
                                const isCurrent = idx === activeIndex;
                                
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                            isCompleted ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-300'
                                        } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                isCompleted ? 'text-gray-900' : 'text-gray-300'
                                            }`}>
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 rounded text-[8px] font-black uppercase animate-pulse">
                                                    Current Stage
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 border-t border-gray-100">
                        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Package className="w-3.5 h-3.5" /> Order Specs
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(order.serviceData).map(([key, val]) => {
                                    if (['orderName', 'fileSubmission', 'deliveryOption', 'paymentMethod', 'specialRemark'].includes(key)) return null;
                                    return (
                                        <div key={key}>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            <p className="text-xs font-bold text-gray-700">{String(val)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <IndianRupee className="w-3.5 h-3.5" /> Financials
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                    <span>Base + Fees</span>
                                    <span>₹{order.baseAmount + order.emailFee}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                    <span>GST (18%)</span>
                                    <span>₹{order.gstAmount}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-100 text-lg font-black text-gray-900">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Total Payable</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>
                                <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 text-center">
                                    <p className="text-[9px] font-black text-[#b65e2e] uppercase tracking-[0.15em]">{order.paymentMethod} Payment</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> File Status
                            </h3>
                            {order.fileSubmission === 'UPLOAD' ? (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-green-700">Design File Received</p>
                                    <p className="text-[9px] text-green-600 mt-1 uppercase font-bold tracking-widest">Ready for Production</p>
                                </div>
                            ) : (
                                <div className="bg-[#fffaf5] border border-[#e8dfd5] rounded-2xl p-6">
                                    <p className="text-[10px] font-bold text-[#b65e2e] uppercase tracking-widest mb-3">Send File Via Email</p>
                                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed mb-4">Please email your design to <span className="font-bold text-gray-900">photowalagift@gmail.com</span></p>
                                    <a href={`mailto:photowalagift@gmail.com?subject=Order Design: ${order.orderNumber}`} className="inline-block px-4 py-2 bg-white border border-[#e8dfd5] rounded-lg text-[10px] font-black text-[#b65e2e] uppercase tracking-widest hover:bg-[#fffaf5] transition-colors">
                                        Email Now
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Need Help with your order?</p>
                    <div className="flex justify-center gap-6">
                        <Link to="/support" className="text-xs font-black text-[#b65e2e] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Support Ticket</Link>
                        <span className="text-gray-200">|</span>
                        <a href="https://wa.me/91XXXXXXXXXX" className="text-xs font-black text-[#b65e2e] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">WhatsApp Help</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
