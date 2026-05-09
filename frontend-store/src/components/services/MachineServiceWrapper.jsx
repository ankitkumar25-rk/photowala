import { useState, useMemo } from 'react';
import { 
  Scissors, Settings, PenTool, UploadCloud, 
  ShoppingCart, HelpCircle, ChevronLeft, 
  Box, Ruler, Info, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import OrderSuccessModal from '../OrderSuccessModal';

export default function MachineServiceWrapper({ 
    serviceType, 
    title, 
    description, 
    icon: Icon,
    materials = [],
    thicknesses = []
}) {
  const navigate = useNavigate();
  const [orderName, setOrderName] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [materialThickness, setMaterialThickness] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dimensions, setDimensions] = useState({ l: '', w: '', h: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultOrder, setResultOrder] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const canOrder = useMemo(() => {
    return (
      orderName.trim() &&
      materialType &&
      (thicknesses.length > 0 ? materialThickness : true) &&
      quantity &&
      dimensions.l && dimensions.w && dimensions.h &&
      selectedFile
    );
  }, [orderName, materialType, materialThickness, quantity, dimensions, selectedFile, thicknesses]);

  const handleSubmit = async () => {
    if (!canOrder) return;
    setIsSubmitting(true);
    try {
        const payload = {
            serviceType,
            orderName,
            serviceData: {
                materialType,
                materialThickness,
                quantity,
                dimensions,
                specialInstructions
            }
        };

        // Note: For machine services, we might need to upload the file to Cloudinary first
        // or send as FormData. For now, let's assume JSON for data and we'll handle file later
        // or use FormData directly.
        
        const formData = new FormData();
        formData.append('serviceType', serviceType);
        formData.append('orderName', orderName);
        formData.append('serviceData', JSON.stringify(payload.serviceData));
        if (selectedFile) formData.append('designFile', selectedFile);

        const { data } = await api.post('/v1/orders/custom-printing/machine-requests', payload);
        
        setResultOrder(data.request);
        setShowSuccess(true);
        toast.success('Quote request submitted!');
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/services" className="inline-flex items-center text-sm text-gray-500 hover:text-[#a64d24] mb-6 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Services
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{title}</h1>
              <p className="text-gray-600 max-w-2xl leading-relaxed">{description}</p>
            </div>
            <div className="bg-[#fdf5ef] border border-[#f5e1d2] rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-[#b65e2e] p-3 rounded-xl text-white">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#b65e2e] uppercase tracking-wider">Machine Status</p>
                <p className="text-sm font-bold text-gray-900">Online & Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Project / Order Name</label>
                  <input 
                    type="text" 
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="e.g., Industrial Part Prototype"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 focus:border-[#b65e2e] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Material Type</label>
                    <select 
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none"
                    >
                      <option value="">-- Select Material --</option>
                      {materials.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  {thicknesses.length > 0 && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Thickness</label>
                        <select 
                        value={materialThickness}
                        onChange={(e) => setMaterialThickness(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none"
                        >
                        <option value="">-- Select Thickness --</option>
                        {thicknesses.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Estimated Quantity</label>
                    <input 
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 50 units"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Dimensions (mm)</label>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="number" placeholder="L" value={dimensions.l} onChange={(e) => setDimensions({...dimensions, l: e.target.value})} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center outline-none" />
                      <input type="number" placeholder="W" value={dimensions.w} onChange={(e) => setDimensions({...dimensions, w: e.target.value})} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center outline-none" />
                      <input type="number" placeholder="H" value={dimensions.h} onChange={(e) => setDimensions({...dimensions, h: e.target.value})} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Technical Design / Drawing</label>
                  <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all ${selectedFile ? 'border-green-400 bg-green-50/30' : 'border-[#d1a88b] bg-[#fffaf5]'}`}>
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                    <UploadCloud className={`w-10 h-10 mb-4 ${selectedFile ? 'text-green-500' : 'text-[#a64d24]'}`} />
                    {selectedFile ? (
                      <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                    ) : (
                      <p className="text-sm font-bold text-gray-900">Drag or <button onClick={() => document.getElementById('file-upload').click()} className="text-[#a64d24] underline">upload design</button></p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Special Instructions</label>
                  <textarea 
                    rows="4"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!canOrder || isSubmitting}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                    canOrder && !isSubmitting ? 'bg-[#a64d24] text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShoppingCart className="w-6 h-6" />}
                  <span className="text-lg">Request Quotation</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-[#1c1a19] text-white rounded-3xl p-8 shadow-xl">
               <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                 <Info className="w-5 h-5 text-[#f0ba9c]" /> Order Guide
               </h3>
               <p className="text-xs text-gray-400 leading-relaxed">
                 Machine services require a technical review. After submission, our engineers will analyze your design and provide a quote within 24 hours.
               </p>
            </div>
          </div>

        </div>
      </div>

      {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl">
               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="w-10 h-10 text-green-500" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Request Sent!</h2>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Ref: {resultOrder?.requestNumber}</p>
               <p className="text-sm text-gray-600 mb-8 leading-relaxed">We have received your request. Our team will review the technical specs and send a quote to your email.</p>
               <Link to="/my-services" className="block w-full bg-[#b65e2e] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#a15024]">Track My Requests</Link>
            </div>
          </div>
      )}
    </div>
  );
}
