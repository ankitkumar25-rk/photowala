import React, { useState } from 'react';
import { useCreateOrder } from '../../services/customPrinting.api';
import OrderSuccessModal from './OrderSuccessModal';
import { toast } from 'react-hot-toast';
import { Loader2, Upload, Mail } from 'lucide-react';

export default function OrderFormWrapper({ servicePath, children, pricingLogic, formData }) {
    const [showModal, setShowModal] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const createOrderMutation = useCreateOrder(servicePath);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic common field validation
        if (!formData.orderName) return toast.error('Order Name is required');

        const submissionData = new FormData();
        
        // Append all form data
        Object.entries(formData).forEach(([key, value]) => {
            submissionData.append(key, value);
        });

        // Handle file
        if (formData.fileSubmission === 'UPLOAD') {
            if (!selectedFile) return toast.error('Please upload a design file');
            submissionData.append('designFile', selectedFile);
        }

        try {
            const result = await createOrderMutation.mutateAsync(submissionData);
            setOrderResult(result.order);
            setShowModal(true);
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                serverErrors.forEach(err => toast.error(`${err.field}: ${err.message}`));
            } else {
                toast.error(error.response?.data?.message || 'Something went wrong');
            }
        }
    };

    const pricePreview = pricingLogic ? pricingLogic(formData) : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inject common fields logic or let children handle it */}
            {children}

            {/* Common Fields: File Submission & Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File Submission</label>
                    <div className="flex gap-2">
                        {[
                            { id: 'UPLOAD', label: 'Upload File', icon: Upload },
                            { id: 'EMAIL', label: 'Via Email', icon: Mail }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => formData.setFileSubmission(opt.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                                    formData.fileSubmission === opt.id 
                                    ? 'border-[#b65e2e] bg-[#fffaf5] text-[#b65e2e]' 
                                    : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <opt.icon className="w-4 h-4" />
                                <span className="text-xs font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    {formData.fileSubmission === 'UPLOAD' && (
                        <div className="mt-3">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            <label 
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#b65e2e] transition-colors cursor-pointer"
                            >
                                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                <span className="text-xs font-bold text-gray-600">
                                    {selectedFile ? selectedFile.name : 'Click to select design file'}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1">PDF, CDR, PSD, JPG, PNG (Max 100MB)</span>
                            </label>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Option</label>
                    <div className="flex gap-2">
                        {[
                            { id: 'COURIER', label: 'Courier' },
                            { id: 'TRANSPORT', label: 'Transport' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => formData.setDeliveryOption(opt.id)}
                                className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                                    formData.deliveryOption === opt.id 
                                    ? 'border-[#b65e2e] bg-[#fffaf5] text-[#b65e2e]' 
                                    : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <span className="text-xs font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                        {formData.deliveryOption === 'COURIER' ? 'Free shipping across India.' : 'Freight charges will be paid by customer on delivery.'}
                    </p>
                </div>
            </div>

            {/* Price Preview */}
            {pricePreview && (
                <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>Base Price</span>
                        <span>₹{pricePreview.baseAmount}</span>
                    </div>
                    {pricePreview.emailFee > 0 && (
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>Email Handling Fee</span>
                            <span>₹{pricePreview.emailFee}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>GST (18%)</span>
                        <span>₹{pricePreview.gstAmount}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Estimated Total</span>
                        <span className="text-2xl font-black text-[#b65e2e]">₹{pricePreview.totalAmount}</span>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-[#b65e2e] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-[#b65e2e]/20 hover:bg-[#a15024] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {createOrderMutation.isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Place Order (COD)'
                )}
            </button>

            {showModal && <OrderSuccessModal order={orderResult} onClose={() => setShowModal(false)} />}
        </form>
    );
}
