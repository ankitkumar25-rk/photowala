import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  HelpCircle, UploadCloud, AlertTriangle, ShoppingCart, Scissors
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { id: 'pen',         icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels', active: true },
  { id: 'digital',    icon: Printer,     label: 'Digital Paper Printing',  to: '#' },
  { id: 'letterhead', icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead' },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '#' },
  { id: 'billbook',   icon: Book,        label: 'Bill Book',               to: '#' },
  { id: 'envelop',    icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const CUT_TYPES = [
  {
    id: 'no-half-cut',
    label: 'Sticker (Without Half Cut)',
    description: 'Standard full-sheet adhesive labels without pre-cut shapes.',
    popular: false,
    bg: 'bg-[#e8f4fb]',
    icon: '🖨️',
    imageBg: '#a8d5eb',
  },
  {
    id: 'round-cut',
    label: 'Sticker (With Round Cut)',
    description: 'Perfectly circular precision-cut labels for branding and seals.',
    popular: true,
    bg: 'bg-[#fdf5ef]',
    icon: '🟠',
    imageBg: '#b65e2e',
  },
  {
    id: 'straight-cut',
    label: 'Sticker (With Straight Cut)',
    description: 'Geometric square or rectangular cuts with clean sharp edges.',
    popular: false,
    bg: 'bg-[#f0f0f0]',
    icon: '▪️',
    imageBg: '#888',
  },
];

const QUANTITY_OPTIONS = ['100 Pcs', '250 Pcs', '500 Pcs', '1000 Pcs', '5000 Pcs'];

const MATERIAL_OPTIONS = [
  'Glossy White Vinyl',
  'Matte White Vinyl',
  'Transparent / Clear',
  'Holographic / Foil',
  'Kraft / Brown Paper',
];

export default function StickerLabels() {
  const [selectedCut, setSelectedCut]     = useState(null);
  const [quantity, setQuantity]           = useState('');
  const [material, setMaterial]           = useState('');
  const [designOption, setDesignOption]   = useState('online');
  const [orderName, setOrderName]         = useState('');

  const selected = CUT_TYPES.find((c) => c.id === selectedCut);
  const canOrder = selected && quantity;

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

        <div className="space-y-4">
          <button className="w-full bg-[#9a4b22] hover:bg-[#7e3d1a] text-white font-semibold py-3 rounded-lg shadow transition-colors text-sm">
            Request Quote
          </button>
          <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium transition-colors">
            <HelpCircle className="w-4 h-4" /> Help Center
          </button>
        </div>
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
          <span className="text-[#a64d24]">Sticker Labels</span>
        </div>

        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Sticker Labels Customization
          </h1>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Professional grade stickers with precision cutting options.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left Column ── */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#e8dfd5] p-6 lg:p-8 shadow-sm">

              {/* Select Cut Type */}
              <div className="flex items-center gap-3 mb-6">
                <Scissors className="w-5 h-5 text-[#a64d24]" />
                <h3 className="text-lg font-bold text-gray-900">Select Cut Type</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                {CUT_TYPES.map((cut) => (
                  <div
                    key={cut.id}
                    onClick={() => setSelectedCut(cut.id)}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                      selectedCut === cut.id
                        ? 'border-[#a64d24] shadow-md scale-[1.02]'
                        : 'border-[#e8dfd5] hover:border-[#d1a88b] hover:shadow'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative h-40 flex items-center justify-center text-6xl"
                      style={{ background: cut.imageBg }}
                    >
                      <span className="opacity-60 text-7xl">{cut.icon}</span>
                      {cut.popular && (
                        <span className="absolute top-3 right-3 bg-[#2e7d52] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-white">
                      <h4 className={`font-bold text-sm mb-1 leading-snug ${selectedCut === cut.id ? 'text-[#a64d24]' : 'text-gray-900'}`}>
                        {cut.label}
                      </h4>
                      <p className={`text-xs leading-relaxed ${selectedCut === cut.id ? 'text-[#b65e2e]' : 'text-gray-500'}`}>
                        {cut.description}
                      </p>
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
                    placeholder="e.g. Product Launch Stickers"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sticker Material</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e] transition-shadow bg-white"
                  >
                    <option value="">-- Select Material --</option>
                    {MATERIAL_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
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
                  <p className="text-xs text-gray-500 mb-6">PDF, AI, EPS, or High-Res PNG (Max 50MB)</p>
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
                    Ensure your artwork has a 3mm bleed and keep all text/logos 2mm inside the safe zone to avoid cut-off.
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
                    <div className="text-xs text-gray-400 mb-1">Selected Cut Type</div>
                    <div className="font-bold text-[#f0ba9c]">{selected.label}</div>
                    <div className="text-xs text-gray-400 mt-2">{selected.description}</div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 border-dashed text-center">
                    <span className="text-sm text-gray-400">Please select a cut type</span>
                  </div>
                )}

                {material && (
                  <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-0.5">Material</div>
                    <div className="text-sm font-semibold text-white">{material}</div>
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
                  {canOrder ? 'Production Time: 3–5 business days' : 'Select cut type & quantity to proceed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
