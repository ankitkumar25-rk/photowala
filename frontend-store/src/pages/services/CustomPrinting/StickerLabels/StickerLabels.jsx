import { useState, useMemo, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  CheckCircle2, Info, ShoppingCart, HelpCircle
} from 'lucide-react';
import { serviceAssets } from '../../../../data/assets';
import OrderFormWrapper from '../../../../components/services/OrderFormWrapper';
import { pricingLogic } from '../../../../utils/pricing';

const SIDEBAR_LINKS = [
  { id: 'pen',         icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels', active: true },
  { id: 'digital',    icon: Printer,     label: 'Digital Paper Printing',  to: '/services/custom-printing/digital-printing' },
  { id: 'letterhead', icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead' },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '/services/custom-printing/garment-tag' },
  { id: 'billbook',   icon: Book,        label: 'Bill Book',               to: '/services/custom-printing/bill-book' },
  { id: 'envelop',    icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const CUT_TYPES = [
  { id: 'no-cut', label: 'Sticker', subLabel: '(Without Half Cut)', path: '/services/custom-printing/sticker-labels/no-cut', image: 'https://cdn-icons-png.flaticon.com/512/4127/4127248.png' },
  { id: 'round-cut', label: 'Sticker', subLabel: '(With Round Cut)', path: '/services/custom-printing/sticker-labels/round-cut', image: 'https://cdn-icons-png.flaticon.com/512/4127/4127249.png' },
  { id: 'straight-cut', label: 'Sticker', subLabel: '(With Straight Cut)', path: '/services/custom-printing/sticker-labels/straight-cut', image: 'https://cdn-icons-png.flaticon.com/512/4127/4127250.png' },
];

const SHEET_SIZES = ['7"x9.5" (Inch)'];
const LAMINATION_OPTIONS = ['Not Required', 'Gloss Lamination'];

const ROUND_OPTIONS = [
  '1 Round Sticker (170x170 MM)', '2 Round Stickers (115x115 MM)', '6 Round Stickers (75x75 MM)',
  '12 Round Stickers (55x55 MM)', '20 Round Stickers (40x40 MM)', '35 Round Stickers (30x30 MM)',
];

const STRAIGHT_OPTIONS = [
  '2 Sticker (Size - 178x118 MM)', '3 Sticker (Size - 178x79 MM)', '4 Sticker (Size - 178x59 MM)',
  '4 Sticker (Size - 90x118 MM)', '6 Sticker (Size - 178x40 MM)', '6 Sticker (Size - 90x80 MM)',
  '6 Sticker (Size - 60x120 MM)', '8 Sticker (Size - 90x59 MM)', '9 Sticker (Size - 60x80 MM)',
  '10 Sticker (Size - 178x24 MM)', '12 Sticker (Size - 90x40 MM)', '12 Sticker (Size - 60x60 MM)',
  '18 Sticker (Size - 60x40 MM)', '20 Sticker (Size - 90x24 MM)', '30 Sticker (Size - 60x24 MM)',
];

export default function StickerLabels() {
  const { type } = useParams();
  const currentType = type || 'no-cut';

  // Form State
  const [orderName, setOrderName]           = useState('');
  const [quantity, setQuantity]             = useState('1000');
  const [sheetSize, setSheetSize]           = useState('7"x9.5" (Inch)');
  const [lamination, setLamination]         = useState('');
  const [deliveryOption, setDeliveryOption] = useState('COURIER');
  const [fileSubmission, setFileSubmission] = useState('UPLOAD');
  const [paymentMethod, setPaymentMethod]   = useState('COD');
  const [specialRemark, setSpecialRemark]   = useState('');
  const [stickerCount, setStickerCount]     = useState('');

  // Reset variant specific state when type changes
  useEffect(() => {
    setStickerCount('');
  }, [currentType]);

  const config = useMemo(() => {
    switch(currentType) {
      case 'round-cut': return { code: 'ST-2', hasCount: true, options: ROUND_OPTIONS, guideImage: '/images/services/round-cut-guide.png', guideTitle: 'Round Cut Layout Guide' };
      case 'straight-cut': return { code: 'ST-3', hasCount: true, options: STRAIGHT_OPTIONS, guideImage: '/images/services/straight-cut-guide.png', guideTitle: 'Straight Cut Layout Guide' };
      default: return { code: 'ST-1', hasCount: false, options: [], guideImage: null };
    }
  }, [currentType]);

  const formData = {
    orderName, quantity: Number(quantity), sheetSize, lamination, stickerType: config.code, stickerCount,
    deliveryOption, fileSubmission, paymentMethod, specialRemark,
    setFileSubmission, setDeliveryOption
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
          <span className="text-[#b65e2e]">Sticker Labels</span>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Sticker Labels</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
            Custom high-quality stickers with multiple cut options. Perfect for product branding, packaging, and promotional materials.
          </p>
        </div>

        {/* Cut Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {CUT_TYPES.map((type) => (
            <Link 
              key={type.id} 
              to={type.path}
              className={`relative bg-white rounded-[2rem] border-2 p-8 flex flex-col items-center text-center transition-all ${
                currentType === type.id ? 'border-[#b65e2e] shadow-xl shadow-[#b65e2e]/5' : 'border-gray-50 hover:border-[#b65e2e]/50'
              }`}
            >
              {currentType === type.id && (
                <div className="absolute top-4 right-4 bg-[#b65e2e] rounded-full p-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              <div className="w-20 h-20 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center">
                <img src={type.image} alt={type.label} className="w-12 h-12 object-contain grayscale opacity-50 group-hover:grayscale-0" />
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">{type.label}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{type.subLabel}</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <OrderFormWrapper 
              servicePath="sticker-labels" 
              formData={formData} 
              pricingLogic={(data) => pricingLogic.STICKER_LABELS(data)}
            >
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">1. Order Configuration</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Name</label>
                    <input 
                      type="text" 
                      value={orderName} 
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="e.g. Product Label Batch #1"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity (Min 1000)</label>
                      <input 
                        type="number" 
                        min="1000"
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sheet Size</label>
                      <select 
                        value={sheetSize} 
                        onChange={(e) => setSheetSize(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {SHEET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lamination</label>
                    <select 
                      value={lamination} 
                      onChange={(e) => setLamination(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                    >
                      <option value="">Select Lamination</option>
                      {LAMINATION_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {config.hasCount && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stickers Count Per Sheet</label>
                      <select 
                        value={stickerCount} 
                        onChange={(e) => setStickerCount(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        <option value="">Select Layout</option>
                        {config.options.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {config.guideImage && (
                  <div className="pt-8 border-t border-gray-50">
                    <div className="bg-gray-50 rounded-[2rem] p-8">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Info className="w-4 h-4 text-[#b65e2e]" /> {config.guideTitle}
                       </h4>
                       <div className="aspect-video bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
                         <img src={config.guideImage} alt="Guide" className="max-w-full max-h-full object-contain opacity-50" />
                       </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6 pt-8 border-t border-gray-50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">2. Extra Details</h3>
                  <textarea 
                    rows="3" 
                    value={specialRemark} 
                    onChange={(e) => setSpecialRemark(e.target.value)}
                    placeholder="Any specific instructions for cutting or packaging?"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all resize-none"
                  />
                </div>
              </div>
            </OrderFormWrapper>
          </div>

          <div className="w-full lg:w-[380px] space-y-8">
            <div className="bg-[#1c1a19] rounded-[2.5rem] p-8 border border-gray-800 shadow-2xl">
              <h3 className="text-xs font-black text-[#b65e2e] uppercase tracking-[0.3em] mb-8">Technical Specs</h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Printing Technology</p>
                    <p className="text-xs font-bold text-gray-200">Komori Offset (2023 Model)</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Lead Time</p>
                    <p className="text-xs font-bold text-gray-200">7 Working Days</p>
                 </div>
                 <div className="pt-6 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                      "We specialize in high-resolution product labels with water-resistant lamination options."
                    </p>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-[#b65e2e] shrink-0" />
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Custom Sizes?</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">If you need a specific size not listed here, please email us for a custom quote.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
