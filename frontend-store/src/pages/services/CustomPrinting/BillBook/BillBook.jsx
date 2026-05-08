import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool, StickyNote, Printer, FileText, Tag, Book, Mail,
  HelpCircle, UploadCloud, AlertTriangle, ShoppingCart, BookOpen, CheckCircle
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { id: 'pen',         icon: PenTool,    label: 'Pen',                    to: '/services/custom-printing/pen' },
  { id: 'sticker',    icon: StickyNote,  label: 'Sticker Labels',         to: '/services/custom-printing/sticker-labels' },
  { id: 'digital',    icon: Printer,     label: 'Digital Paper Printing',  to: '/services/custom-printing/digital-printing' },
  { id: 'letterhead', icon: FileText,    label: 'Letterhead',              to: '/services/custom-printing/letterhead' },
  { id: 'garment',    icon: Tag,         label: 'Garment Tag',             to: '/services/custom-printing/garment-tag' },
  { id: 'billbook',   icon: Book,        label: 'Bill Book',               to: '/services/custom-printing/bill-book', active: true },
  { id: 'envelop',    icon: Mail,        label: 'Envelop',                 to: '/services/custom-printing/envelop' },
];

const FORMATS = [
  {
    id: '2copy', name: 'A4 Bill Book - 2 Copy', bestSeller: true,
    features: ['Carbonless NCR Paper', 'Standard A4 Size', 'Production: 3 Working Days'],
    price: '₹850', imageBg: '#c8b89a', emoji: '📋',
  },
  {
    id: '3copy', name: 'A4 Bill Book - 3 Copy', bestSeller: false,
    features: ['Carbonless NCR Paper (White/Pink/Yellow)', 'Standard A4 Size', 'Production: 3 Working Days'],
    price: '₹1,200', imageBg: '#f4a261', emoji: '📒',
  },
];

export default function BillBook() {
  const [sel, setSel]         = useState(null);
  const [qty, setQty]         = useState('');
  const [pages, setPages]     = useState('');
  const [dOpt, setDOpt]       = useState('online');
  const [name, setName]       = useState('');
  const selected = FORMATS.find((f) => f.id === sel);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-[#f2eee9] border-r border-[#e8dfd5] flex flex-col p-6 shrink-0">
        <div className="mb-8"><h2 className="text-xl font-bold text-gray-900 mb-1">Service Index</h2><p className="text-xs text-gray-500">Explore categories</p></div>
        <nav className="flex-1 space-y-2 mb-8">
          {SIDEBAR_LINKS.map((l) => { const I = l.icon; return (
            <Link key={l.id} to={l.to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${l.active ? 'bg-[#b65e2e] text-white shadow-md' : 'text-gray-600 hover:bg-[#e8dfd5] hover:text-gray-900'}`}>
              <I className="w-4 h-4" />{l.label}
            </Link>
          );})}
        </nav>
        <div className="space-y-4">
          <button className="w-full bg-[#9a4b22] hover:bg-[#7e3d1a] text-white font-semibold py-3 rounded-lg shadow transition-colors text-sm">Request Quote</button>
          <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"><HelpCircle className="w-4 h-4" /> Help Center</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:p-12">
        <div className="text-sm font-medium mb-8 flex items-center gap-2">
          <Link to="/" className="text-[#3b71ca] hover:text-[#285192]">Home</Link><span className="text-gray-500">›</span>
          <Link to="/services" className="text-[#3b71ca] hover:text-[#285192]">Our Services</Link><span className="text-gray-500">›</span>
          <Link to="/services/custom-printing" className="text-[#3b71ca] hover:text-[#285192]">Custom Printing</Link><span className="text-gray-500">›</span>
          <span className="text-[#a64d24]">Bill Book</span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Bill Book Customization</h1>
          <p className="text-gray-600 max-w-3xl leading-relaxed">Professional carbonless billing solutions for your business.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#e8dfd5] p-6 lg:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6"><BookOpen className="w-5 h-5 text-[#a64d24]" /><h3 className="text-lg font-bold text-gray-900">Select Format</h3></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {FORMATS.map((f) => (
                  <div key={f.id} onClick={() => setSel(f.id)}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${sel === f.id ? 'border-[#a64d24] shadow-md scale-[1.01]' : 'border-[#e8dfd5] hover:border-[#d1a88b] hover:shadow'}`}>
                    <div className="relative h-44 flex items-center justify-center text-7xl" style={{ background: f.imageBg }}>
                      <span className="opacity-60">{f.emoji}</span>
                      {f.bestSeller && <span className="absolute top-3 left-3 bg-[#2e7d52] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">Best Seller</span>}
                    </div>
                    <div className="p-5 bg-white">
                      <h4 className={`font-bold text-base mb-3 ${sel === f.id ? 'text-[#a64d24]' : 'text-gray-900'}`}>{f.name}</h4>
                      <ul className="space-y-1.5 mb-4">
                        {f.features.map((ft, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle className="w-3.5 h-3.5 text-[#2e7d52] shrink-0 mt-0.5" />{ft}
                          </li>
                        ))}
                      </ul>
                      <p className={`font-bold text-lg ${sel === f.id ? 'text-[#a64d24]' : 'text-gray-800'}`}>From {f.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Order Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. March Invoice Books"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e]" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Books)</label>
                  <select value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e]">
                    <option value="">-- Select Quantity --</option>
                    {['50 Books','100 Books','200 Books','500 Books'].map((q) => <option key={q}>{q}</option>)}
                  </select></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Pages per Book</label>
                  <select value={pages} onChange={(e) => setPages(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b65e2e]/50 focus:border-[#b65e2e]">
                    <option value="">-- Select Pages --</option>
                    {['25 Pages','50 Pages','100 Pages'].map((p) => <option key={p}>{p}</option>)}
                  </select></div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Design File</label>
                <div className="flex items-center gap-6 mb-4">
                  {['online','email'].map((o) => (
                    <div key={o} className="flex items-center gap-2 cursor-pointer" onClick={() => setDOpt(o)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${dOpt===o?'border-[#b65e2e]':'border-gray-300'}`}>{dOpt===o&&<div className="w-2 h-2 rounded-full bg-[#b65e2e]"/>}</div>
                      <span className="text-sm font-medium text-gray-800">{o==='online'?'Attach File Online':'Send via Email'}</span>
                    </div>
                  ))}
                </div>
                <div className="border-2 border-dashed border-[#d1a88b] bg-[#fffaf5] rounded-xl p-10 flex flex-col items-center text-center hover:bg-[#fbf4ea]">
                  <UploadCloud className="w-10 h-10 text-[#a64d24] mb-3" />
                  <p className="text-sm font-bold text-gray-800 mb-1">Drag and drop your design here</p>
                  <p className="text-xs text-gray-500 mb-6">PDF, AI, or High-Res PNG (Max 50MB)</p>
                  <button className="border border-[#b65e2e] text-[#b65e2e] hover:bg-[#b65e2e] hover:text-white transition-colors font-semibold py-2 px-6 rounded-lg text-sm bg-white">Choose File</button>
                </div>
              </div>

              <div className="bg-[#fff4f2] border border-[#f5c6cb] rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div><h4 className="text-sm font-bold text-red-700">Serial Number Notice</h4>
                  <p className="text-xs text-red-600 mt-0.5">Mention in remarks if you need serial numbering (additional charges may apply).</p></div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-6">
            <div className="bg-[#1c1a19] text-white rounded-2xl overflow-hidden shadow-lg border border-gray-800">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-6 border-b border-gray-700 pb-3">Order Summary</h3>
                {selected ? (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Selected Format</div>
                    <div className="font-bold text-[#f0ba9c]">{selected.name}</div>
                    <div className="text-sm font-bold text-[#f0ba9c] mt-2">From {selected.price}</div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700 border-dashed text-center">
                    <span className="text-sm text-gray-400">Please select a format</span>
                  </div>
                )}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Quantity</span><span className="font-medium">{qty||'-'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Pages / Book</span><span className="font-medium">{pages||'-'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">GST (18%)</span><span className="font-medium">-</span></div>
                </div>
                <div className="flex justify-between items-center mb-8 border-t border-gray-700 pt-4">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl">-</span>
                </div>
                <button disabled={!sel||!qty}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-colors mb-4 ${sel&&qty?'bg-[#b65e2e] hover:bg-[#a15024] text-white cursor-pointer':'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                  <ShoppingCart className="w-5 h-5" /> Add Order
                </button>
                <p className="text-center text-xs text-gray-500 italic">{sel&&qty?'Est. delivery: 3 working days':'Select format & quantity to proceed'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
