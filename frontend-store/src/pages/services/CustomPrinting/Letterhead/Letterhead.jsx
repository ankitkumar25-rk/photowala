import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  CheckCircle2, Info, ShoppingCart, HelpCircle, AlertTriangle
} from 'lucide-react';
import OrderFormWrapper from '../../../../components/services/OrderFormWrapper';
import { pricingLogic } from '../../../../utils/pricing';

const SIDEBAR_LINKS = [
  { id: 'pen',        icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels' },
  { id: 'digital',   icon: Printer,     label: 'Digital Paper Printing',  to: '/services/custom-printing/digital-printing' },
  { id: 'letterhead',icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead', active: true },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '/services/custom-printing/garment-tag' },
  { id: 'billbook',  icon: Book,        label: 'Bill Book',               to: '/services/custom-printing/bill-book' },
  { id: 'envelop',   icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const LETTERHEAD_PRODUCTS_LIST = [
  { id: 'LH-1-A4', name: '70 GSM Maplitho (A4)', code: 'LH-1', size: 'A4', gsm: '70 GSM' },
  { id: 'LH-2-A4', name: '90 GSM Sunshine (A4)', code: 'LH-2', size: 'A4', gsm: '90 GSM' },
  { id: 'LH-3-A4', name: '100 GSM Bond (A4)', code: 'LH-3', size: 'A4', gsm: '100 GSM' },
  { id: 'LH-4-A4', name: '100 GSM Deo (A4)', code: 'LH-4', size: 'A4', gsm: '100 GSM' },
  { id: 'LH-5-A4', name: '115 GSM Sunshine (A4)', code: 'LH-5', size: 'A4', gsm: '115 GSM' },
];

const BINDING_OPTIONS = ['Not Required', 'Pad (100 Leaves)', 'Pockets'];
const QUANTITY_OPTIONS = [1000, 2000, 3000, 4000, 8000, 12000, 16000];
const PRINTING_OPTIONS = ['Single Side', 'Both Side'];

export default function Letterhead() {
  const [orderName, setOrderName]           = useState('');
  const [selProductId, setSelProductId]     = useState('');
  const [printing, setPrinting]             = useState('Single Side');
  const [binding, setBinding]               = useState('Not Required');
  const [quantity, setQuantity]             = useState('1000');
  const [deliveryOption, setDeliveryOption] = useState('COURIER');
  const [fileSubmission, setFileSubmission] = useState('UPLOAD');
  const [paymentMethod, setPaymentMethod]   = useState('COD');
  const [specialRemark, setSpecialRemark]   = useState('');

  const selectedProduct = LETTERHEAD_PRODUCTS_LIST.find(p => p.id === selProductId);

  const formData = {
    orderName, 
    product: selectedProduct?.code || '', 
    quantity: Number(quantity), 
    printing, 
    binding,
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
          <span className="text-[#b65e2e]">Letterhead</span>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Corporate Letterheads</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
            Premium quality letterheads with multiple paper options. Excellent printing quality with latest Komori offset machines.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <OrderFormWrapper 
              servicePath="letterhead" 
              formData={formData} 
              pricingLogic={(data) => pricingLogic.LETTERHEAD(data)}
            >
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">1. Order Details</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Name</label>
                    <input 
                      type="text" 
                      value={orderName} 
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="e.g. Annual Company Letterheads"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Product / Paper Type</label>
                    <select 
                      value={selProductId} 
                      onChange={(e) => setSelProductId(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                    >
                      <option value="">Select Paper</option>
                      {LETTERHEAD_PRODUCTS_LIST.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                      <select 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        <option value="">Select Qty</option>
                        {QUANTITY_OPTIONS.map(q => <option key={q} value={q}>{q} Units</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Printing</label>
                      <select 
                        value={printing} 
                        onChange={(e) => setPrinting(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {PRINTING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Binding Style</label>
                    <select 
                      value={binding} 
                      onChange={(e) => setBinding(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                    >
                      {BINDING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">2. Special Remark</h3>
                  <textarea 
                    rows="3" 
                    value={specialRemark} 
                    onChange={(e) => setSpecialRemark(e.target.value)}
                    placeholder="Any specific instructions for processing?"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all resize-none"
                  />
                </div>
              </div>
            </OrderFormWrapper>
          </div>

          <div className="w-full lg:w-[380px] space-y-8">
            <div className="bg-[#1c1a19] rounded-[2.5rem] p-8 border border-gray-800 shadow-2xl">
              <h3 className="text-xs font-black text-[#b65e2e] uppercase tracking-[0.3em] mb-8">Service Features</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Offset Perfection</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Latest 2023 Komori offset printing technology.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Fast Delivery</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Production within 48 hours from file approval.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-[#fff4f2] border border-[#f5c6cb] rounded-[2rem] p-8 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-red-900 uppercase tracking-widest mb-1">Bleed Warning</h4>
                <p className="text-[10px] text-red-600 font-bold leading-relaxed">Please ensure your artwork has at least 3mm bleed on all sides.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
