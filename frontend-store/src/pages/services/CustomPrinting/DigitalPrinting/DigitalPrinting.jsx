import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  HelpCircle, Layers, Package, Truck, CheckCircle2
} from 'lucide-react';
import OrderFormWrapper from '../../../../components/services/OrderFormWrapper';
import { pricingLogic } from '../../../../utils/pricing';

const SIDEBAR_LINKS = [
  { id: 'pen', icon: PenTool, label: 'Pen', to: '/services/custom-printing/pen' },
  { id: 'sticker', icon: StickyNote, label: 'Sticker Labels', to: '/services/custom-printing/sticker-labels' },
  { id: 'digital', icon: Printer, label: 'Digital Paper Printing', to: '/services/custom-printing/digital-printing', active: true },
  { id: 'letterhead', icon: FileText, label: 'Letterhead', to: '/services/custom-printing/letterhead' },
  { id: 'garment', icon: Tag, label: 'Garment Tag', to: '/services/custom-printing/garment-tag' },
  { id: 'billbook', icon: Book, label: 'Bill Book', to: '/services/custom-printing/bill-book' },
  { id: 'envelop', icon: Mail, label: 'Envelop', to: '/services/custom-printing/envelop' },
];

const PAPER_PRODUCTS = [
  { id: 'art-170', name: 'Art Paper 170 GSM', emoji: '🎨', imageBg: '#2d4a3e' },
  { id: 'art-300', name: 'Art Paper 300 GSM', emoji: '📄', imageBg: '#3a3a3a' },
  { id: 'sticker', name: 'Sticker Paper', emoji: '🏷️', imageBg: '#c9a227' },
  { id: 'metallic', name: 'Metallic Paper', emoji: '✨', imageBg: '#e8e0d0' },
];

const LAMINATION_OPTIONS = ['None', 'Matt', 'Gloss'];

export default function DigitalPrinting() {
  const [orderName, setOrderName]           = useState('');
  const [productType, setProductType]       = useState('');
  const [quantity, setQuantity]             = useState('10');
  const [lamination, setLamination]         = useState('None');
  const [deliveryOption, setDeliveryOption] = useState('COURIER');
  const [fileSubmission, setFileSubmission] = useState('UPLOAD');
  const [paymentMethod, setPaymentMethod]   = useState('COD');
  const [specialRemark, setSpecialRemark]   = useState('');

  const formData = {
    orderName, 
    productType, 
    quantity: Number(quantity), 
    lamination,
    deliveryOption, 
    fileSubmission, 
    paymentMethod, 
    specialRemark,
    setFileSubmission, 
    setDeliveryOption
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 bg-[#f2eee9] border-r border-[#e8dfd5] flex flex-col p-6 shrink-0">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-1 uppercase tracking-tight">Service Index</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Explore Categories</p>
        </div>
        <nav className="flex-1 space-y-2 mb-8">
          {SIDEBAR_LINKS.map((link) => (
            <Link key={link.id} to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                link.active
                  ? 'bg-[#b65e2e] shadow-lg shadow-[#b65e2e]/20 text-white translate-x-2'
                  : 'text-gray-500 hover:bg-white hover:text-gray-900'
              }`}
            >
              <link.icon className="w-4 h-4" />{link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-12 flex items-center gap-2 text-gray-400">
          <Link to="/" className="hover:text-[#b65e2e] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-[#b65e2e] transition-colors">Services</Link>
          <span>/</span>
          <span className="text-[#b65e2e]">Digital Printing</span>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Digital Paper Printing</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
            Professional high-resolution digital prints on premium media. Perfect for brochures, certificates, and marketing collaterals.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <OrderFormWrapper 
              servicePath="digital-printing" 
              formData={formData} 
              pricingLogic={(data) => pricingLogic.DIGITAL_PRINTING(data)}
            >
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">1. Product Selection</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {PAPER_PRODUCTS.map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => setProductType(p.name)}
                        className={`rounded-2xl p-4 border-2 cursor-pointer transition-all text-center ${
                          productType === p.name ? 'border-[#b65e2e] bg-[#fffaf5] shadow-lg' : 'border-gray-50 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ background: p.imageBg + '20' }}>
                          {p.emoji}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-900">{p.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Name</label>
                    <input 
                      type="text" 
                      value={orderName} 
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="e.g. Marketing Brochure Q4"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lamination</label>
                      <select 
                        value={lamination} 
                        onChange={(e) => setLamination(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {LAMINATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">2. Extra Instructions</h3>
                  <textarea 
                    rows="3" 
                    value={specialRemark} 
                    onChange={(e) => setSpecialRemark(e.target.value)}
                    placeholder="Any specific instructions for binding or paper size (if not 12x18)?"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all resize-none"
                  />
                </div>
              </div>
            </OrderFormWrapper>
          </div>

          <div className="w-full lg:w-[380px] space-y-8">
            <div className="bg-[#1c1a19] rounded-[2.5rem] p-8 border border-gray-800 shadow-2xl">
              <h3 className="text-xs font-black text-[#b65e2e] uppercase tracking-[0.3em] mb-8">Production Info</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Same Day Dispatch</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Orders placed before 2 PM are processed same day.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Premium Media</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">We use only high-grade SRA3 media for consistent color.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-[#b65e2e] shrink-0" />
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Custom Sizes?</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">For NT-PVC or larger posters, please contact our support.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
