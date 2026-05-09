import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  CheckCircle2, Info, ShoppingCart, HelpCircle, BookOpen, Layers
} from 'lucide-react';
import OrderFormWrapper from '../../../../components/services/OrderFormWrapper';
import { pricingLogic } from '../../../../utils/pricing';

const SIDEBAR_LINKS = [
  { id: 'pen',        icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels' },
  { id: 'digital',   icon: Printer,     label: 'Digital Paper Printing',  to: '/services/custom-printing/digital-printing' },
  { id: 'letterhead',icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead' },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '/services/custom-printing/garment-tag' },
  { id: 'billbook',  icon: Book,        label: 'Bill Book',               to: '/services/custom-printing/bill-book', active: true },
  { id: 'envelop',   icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const BILL_BOOK_PRODUCTS = [
  { id: 'A4-2', name: 'A4 Bill Book (2 Copy)', copies: 2 },
  { id: 'A4-3', name: 'A4 Bill Book (3 Copy)', copies: 3 },
];

const PAPER_QUALITY_OPTIONS = [
  '70 GSM Maplitho', '90 GSM Sunshine', '100 GSM Deo'
];

const BINDING_OPTIONS = ['Normal Binding', 'Premium Padded'];

export default function BillBook() {
  const [orderName, setOrderName]           = useState('');
  const [bookType, setBookType]             = useState('A4-2');
  const [quantity, setQuantity]             = useState('10');
  const [paperQuality, setPaperQuality]     = useState('70 GSM Maplitho');
  const [binding, setBinding]               = useState('Normal Binding');
  const [deliveryOption, setDeliveryOption] = useState('COURIER');
  const [fileSubmission, setFileSubmission] = useState('UPLOAD');
  const [paymentMethod, setPaymentMethod]   = useState('COD');
  const [specialRemark, setSpecialRemark]   = useState('');

  const formData = {
    orderName, 
    bookType, 
    quantity: Number(quantity), 
    paperQuality, 
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
          <span className="text-[#b65e2e]">Bill Book</span>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Bill Book Printing</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
            Custom invoice and bill books with serial numbering. Available in 2-copy and 3-copy formats with high-quality carbonless or maplitho paper.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <OrderFormWrapper 
              servicePath="bill-book" 
              formData={formData} 
              pricingLogic={(data) => pricingLogic.BILL_BOOK(data)}
            >
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">1. Book Details</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Name</label>
                    <input 
                      type="text" 
                      value={orderName} 
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="e.g. Retail Shop Invoice Book"
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Book Type</label>
                      <select 
                        value={bookType} 
                        onChange={(e) => setBookType(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {BILL_BOOK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity (Min 10)</label>
                      <input 
                        type="number" 
                        min="10"
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paper Quality</label>
                      <select 
                        value={paperQuality} 
                        onChange={(e) => setPaperQuality(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                      >
                        {PAPER_QUALITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
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
                </div>

                <div className="space-y-6 pt-8 border-t border-gray-50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">2. Special Remark</h3>
                  <textarea 
                    rows="3" 
                    value={specialRemark} 
                    onChange={(e) => setSpecialRemark(e.target.value)}
                    placeholder="e.g. Start numbering from 1001."
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
                    <BookOpen className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Serial Numbering</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Automatic serial numbering included in the price.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Layers className="w-5 h-5 text-[#b65e2e] shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Multi-Color Ready</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Latest offset machines for vibrant logo printing on invoices.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-[#b65e2e] shrink-0" />
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Need 4 Copies?</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">For quad-copy or custom sizes, please email us for a quote.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
