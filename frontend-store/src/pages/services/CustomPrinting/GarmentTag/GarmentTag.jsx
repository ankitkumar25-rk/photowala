import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  CheckCircle2, Info, ShoppingCart, HelpCircle, Scissors, Sparkles
} from 'lucide-react';
import OrderFormWrapper from '../../../../components/services/OrderFormWrapper';
import { pricingLogic } from '../../../../utils/pricing';

const SIDEBAR_LINKS = [
  { id: 'pen',        icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels' },
  { id: 'digital',   icon: Printer,     label: 'Digital Paper Printing',  to: '/services/custom-printing/digital-printing' },
  { id: 'letterhead',icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead' },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '/services/custom-printing/garment-tag', active: true },
  { id: 'billbook',  icon: Book,        label: 'Bill Book',               to: '/services/custom-printing/bill-book' },
  { id: 'envelop',   icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const GARMENT_TYPES = [
  { id: 'gloss', label: 'Gloss Coated', to: '/services/custom-printing/garment-tag/gloss' },
  { id: 'matt', label: 'Matt Lamination', to: '/services/custom-printing/garment-tag/matt' },
  { id: 'uv', label: 'Spot UV', to: '/services/custom-printing/garment-tag/uv' },
  { id: 'thread', label: 'Garment Threads', to: '/services/custom-printing/garment-tag/thread' },
];

const SIZE_OPTIONS = ['Large', 'Medium', 'Small'];
const QUANTITY_OPTIONS = [2000, 4000, 6000, 8000, 10000];
const DIE_SHAPES = Array.from({ length: 5 }, (_, i) => `Die No. ${i + 1}`);

export default function GarmentTag() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('gloss');

  // Form State
  const [orderName, setOrderName]           = useState('');
  const [size, setSize]                     = useState('Medium');
  const [quantity, setQuantity]             = useState('2000');
  const [dieShape, setDieShape]             = useState('Die No. 1');
  const [deliveryOption, setDeliveryOption] = useState('COURIER');
  const [fileSubmission, setFileSubmission] = useState('UPLOAD');
  const [paymentMethod, setPaymentMethod]   = useState('COD');
  const [specialRemark, setSpecialRemark]   = useState('');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('gloss')) setActiveTab('gloss');
    else if (path.includes('matt')) setActiveTab('matt');
    else if (path.includes('uv')) setActiveTab('uv');
    else if (path.includes('thread')) setActiveTab('thread');
  }, [location.pathname]);

  const formData = {
    orderName, 
    tagType: activeTab.toUpperCase(), 
    quantity: Number(quantity), 
    size, 
    dieShape,
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
          <span className="text-[#b65e2e]">Garment Tags</span>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Premium Garment Tags</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
            Elevate your brand with high-quality hang tags. Multiple finishes including Gloss, Matt, and Spot UV with custom die-cutting.
          </p>
        </div>

        {/* Sub-tabs for Tag Types */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {GARMENT_TYPES.map(type => (
            <Link key={type.id} to={type.to}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                activeTab === type.id 
                  ? 'bg-[#b65e2e] text-white border-[#b65e2e] shadow-xl' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
              }`}
            >
              {type.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <OrderFormWrapper 
              servicePath="garment-tag" 
              formData={formData} 
              pricingLogic={(data) => pricingLogic.GARMENT_TAG(data)}
            >
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">1. Tag Configuration</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Name</label>
                    <input 
                      type="text" 
                      value={orderName} 
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="e.g. Summer Collection Tags 2024"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tag Size</label>
                      <select 
                        value={size} 
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                      <select 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {QUANTITY_OPTIONS.map(q => <option key={q} value={q}>{q} Units</option>)}
                      </select>
                    </div>
                  </div>

                  {activeTab !== 'thread' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Die Shape / Layout</label>
                      <select 
                        value={dieShape} 
                        onChange={(e) => setDieShape(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {DIE_SHAPES.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">2. Special Instructions</h3>
                  <textarea 
                    rows="3" 
                    value={specialRemark} 
                    onChange={(e) => setSpecialRemark(e.target.value)}
                    placeholder="e.g. Need hole punch at top center."
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all resize-none"
                  />
                </div>
              </div>
            </OrderFormWrapper>
          </div>

          <div className="w-full lg:w-[380px] space-y-8">
            <div className="bg-[#1c1a19] rounded-[2.5rem] p-8 border border-gray-800 shadow-2xl">
              <h3 className="text-xs font-black text-[#b65e2e] uppercase tracking-[0.3em] mb-8">Production Quality</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <Scissors className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Custom Die Cutting</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Precision cutting for unique tag shapes and rounded corners.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Sparkles className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Spot UV Finish</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Add a premium high-gloss effect to your logo or specific design elements.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-start gap-4">
              <Info className="w-6 h-6 text-[#b65e2e] shrink-0" />
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Production Time</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Usually dispatched within 7-10 working days due to complex die-cutting processes.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
