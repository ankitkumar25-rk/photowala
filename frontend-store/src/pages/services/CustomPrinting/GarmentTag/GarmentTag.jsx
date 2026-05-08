import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  HelpCircle, UploadCloud, AlertTriangle, ShoppingCart, Layers
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { id: 'pen',         icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels' },
  { id: 'digital',    icon: Printer,     label: 'Digital Paper Printing',  to: '/services/custom-printing/digital-printing' },
  { id: 'letterhead', icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead' },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '/services/custom-printing/garment-tag', active: true },
  { id: 'billbook',   icon: Book,        label: 'Bill Book',               to: '/services/custom-printing/bill-book' },
  { id: 'envelop',    icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const GARMENT_PRODUCTS = [
  {
    id: 'THREAD',
    name: 'THREAD',
    subtitle: null,
    detail: 'Dispatch Time : 2 day',
    productionTime: '2 day',
    imageBg: '#e0ddd8',
    emoji: '🧵',
    popular: false,
  },
  {
    id: 'GLOSS',
    name: 'GLOSS',
    subtitle: 'High Gloss UV Coating',
    detail: 'Production Time : 7-10 days',
    productionTime: '7-10 days',
    imageBg: '#00bcd4',
    emoji: '✨',
    popular: true,
  },
  {
    id: 'MATT',
    name: 'MATT',
    subtitle: '350 GSM Paper, Matt Lamination',
    detail: 'Production Time : 7-10 day',
    productionTime: '7-10 day',
    imageBg: '#c8c0b0',
    emoji: '🏷️',
    popular: false,
  },
  {
    id: 'MATT_UV',
    name: 'MATT LAMINATION + UV',
    subtitle: '400 GSM Paper, Matt Lamination',
    detail: 'Production Time : 7-10 day',
    productionTime: '7-10 day',
    imageBg: '#2c2c2c',
    emoji: '🖤',
    popular: false,
  },
];

const QUANTITY_OPTIONS = ['100 Pcs', '250 Pcs', '500 Pcs', '1000 Pcs', '5000 Pcs'];
const SIZE_OPTIONS     = ['2x3 inch', '2x4 inch', '3x4 inch', '3x5 inch', 'Custom Size'];

export default function GarmentTag() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity]               = useState('');
  const [size, setSize]                       = useState('');
  const [designOption, setDesignOption]       = useState('online');
  const [orderName, setOrderName]             = useState('');

  const selected  = GARMENT_PRODUCTS.find((p) => p.id === selectedProduct);
  const canOrder  = selected && quantity;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 bg-[#f2eee9] border-r border-[#e8dfd5] flex flex-col p-6 shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Service Index</h2>
          <p className="text-xs text-gray-500">Explore categories</p>
        </div>

        <nav className="flex-1 space-y-2 mb-8">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  link.active
                    ? 'bg-[#b65e2e] text-white shadow-md'
                    : 'text-gray-600 hover:bg-[#e8dfd5] hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 md:p-10 lg:p-12">
        {/* Breadcrumb */}
        <div className="text-sm font-medium mb-8 flex items-center gap-2">
          <Link to="/" className="text-[#3b71ca] hover:text-[#285192] transition-colors">Home</Link>
          <span className="text-gray-500">›</span>
          <Link to="/services" className="text-[#3b71ca] hover:text-[#285192] transition-colors">Our Services</Link>
          <span className="text-gray-500">›</span>
          <Link to="/services/custom-printing" className="text-[#3b71ca] hover:text-[#285192] transition-colors">Custom Printing</Link>
          <span className="text-gray-500">›</span>
          <span className="text-[#a64d24]">Garment Tag</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Garment Tags
          </h1>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            High-quality custom garment tags in gloss, matt, and UV finishes. Perfect for clothing brands, boutiques, and fashion labels.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left Column ── */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#e8dfd5] p-6 lg:p-8 shadow-sm">

              {/* SELECT PRODUCT */}
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-5 h-5 text-[#a64d24]" />
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Select Product</h3>
              </div>

              {/* Product Grid — 4 columns */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {GARMENT_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                      selectedProduct === product.id
                        ? 'border-[#a64d24] shadow-md scale-[1.02]'
                        : 'border-[#e8dfd5] hover:border-[#d1a88b] hover:shadow'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative h-36 flex items-center justify-center text-6xl"
                      style={{ background: product.imageBg }}
                    >
                      <span className="opacity-70 text-6xl">{product.emoji}</span>
                      {product.popular && (
                        <span className="absolute top-2 right-2 bg-[#2e7d52] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white">
                      <p className={`font-bold text-[12px] mb-0.5 leading-tight uppercase tracking-wide ${
                        selectedProduct === product.id ? 'text-[#a64d24]' : 'text-[#1e3a6e]'
                      }`}>
                        {product.name}
                      </p>
                      {product.subtitle && (
                        <p className={`text-[10px] mb-1 leading-snug ${
                          selectedProduct === product.id ? 'text-[#b65e2e]' : 'text-[#3b71ca]'
                        }`}>
                          {product.subtitle}
                        </p>
                      )}
                      <p className="text-[10px] font-semibold text-gray-600">{product.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details */}
              <div className="border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order Name</label>
                  <input
                    type="text"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="e.g. Summer Collection Tags"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow bg-white"
                  >
                    <option value="">-- Select Quantity --</option>
                    {QUANTITY_OPTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tag Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow bg-white"
                  >
                    <option value="">-- Select Size --</option>
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Design File */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Design File</label>
                <div className="flex items-center gap-6 mb-4">
                  {['online', 'email'].map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setDesignOption(opt)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${designOption === opt ? 'border-[#b65e2e]' : 'border-gray-300'}`}>
                        {designOption === opt && <div className="w-2 h-2 rounded-full bg-[#b65e2e]" />}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {opt === 'online' ? 'Attach File Online' : 'Send via Email'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-[#d1a88b] bg-[#fffaf5] rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#fbf4ea]">
                  <UploadCloud className="w-10 h-10 text-[#a64d24] mb-3" />
                  <p className="text-sm font-bold text-gray-800 mb-1">Drag and drop your design here</p>
                  <p className="text-xs text-gray-500 mb-6">PDF, AI, CDR, or High-Res PNG (Max 50MB)</p>
                  <button className="border border-[#b65e2e] text-[#b65e2e] hover:bg-[#b65e2e] hover:text-white transition-colors font-semibold py-2 px-6 rounded-lg text-sm bg-white">
                    Choose File
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-[#fff4f2] border border-[#f5c6cb] rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-700">Bleed Area Reminder</h4>
                  <p className="text-xs text-red-600 mt-0.5">
                    Ensure your artwork has a 3mm bleed on all sides. Keep important elements 2mm inside the safe zone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (Summary) ── */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-6">
            <div className="bg-[#1c1a19] text-white rounded-2xl overflow-hidden shadow-lg border border-gray-800">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-6 border-b border-gray-700 pb-3">Order Summary</h3>

                {selected ? (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Selected Product</div>
                    <div className="font-bold text-[#f0ba9c] uppercase">{selected.name}</div>
                    {selected.subtitle && (
                      <div className="text-xs text-gray-300 mt-1">{selected.subtitle}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">{selected.detail}</div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 border-dashed text-center">
                    <span className="text-sm text-gray-400">Please select a product type</span>
                  </div>
                )}

                {size && (
                  <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-0.5">Tag Size</div>
                    <div className="text-sm font-semibold text-white">{size}</div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantity</span>
                    <span className="font-medium">{quantity || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base Cost</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">GST (18%)</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8 border-t border-gray-700 pt-4">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl text-white">-</span>
                </div>

                <button
                  disabled={!canOrder}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-colors mb-4 ${
                    canOrder
                      ? 'bg-[#b65e2e] hover:bg-[#a15024] text-white cursor-pointer'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" /> Add Order
                </button>

                <p className="text-center text-xs text-gray-500 italic">
                  {canOrder
                    ? `Est. delivery: ${selected.productionTime}`
                    : 'Select product & quantity to proceed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



